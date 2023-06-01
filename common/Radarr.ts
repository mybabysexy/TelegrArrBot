import axios from "axios";
import {env} from "./env";
import redis from "./Redis";
import {slugify, willDebug} from "./functions";
import {DeleteMovieOptions, Movie, Queue} from "./types";
import {REPLIES} from "./constants";
import {get} from "lodash";

class Radarr {
    private readonly apiKey: string;
    private readonly host: string;

    constructor() {
        this.apiKey = env('RADARR_API_KEY');
        this.host = env('RADARR_HOST');
    }

    async callApi(url, method = 'GET', data: any = null): Promise<any> {
        const response = await axios({
            method,
            url,
            data,
            headers: {
                'X-Api-Key': this.apiKey,
            },
        });
        return response.data;
    }

    async getLocalMovies(): Promise<[Movie]> {
        return redis.get('radarr:movies', async () => {
            willDebug('Cache expired - Fetching movies from Radarr');
            const _movies = await this.callApi(`${this.host}/api/v3/movie`);
            await redis.set('radarr:movies', _movies);
            return _movies;
        });
    }

    async lookupMovies(movieName: string): Promise<[Movie]> {
        const cacheKey = `radarr:movies-${slugify(movieName)}`;
        return redis.get(cacheKey, async () => {
            willDebug(`Looking up movies from Radarr for "${movieName}"`);
            const _movies = await this.callApi(`${this.host}/api/v3/movie/lookup?term=${movieName}`);
            await redis.flash(cacheKey, _movies, 30);
            return _movies;
        });
    }

    async lookupMovieByTmdbId(tmdbId: string | number): Promise<Movie> {
        try {
            return await this.callApi(`${this.host}/api/v3/movie/lookup/tmdb?tmdbId=${tmdbId}`);
        } catch (e) {
            throw new Error(REPLIES.TMDB_ID_NOT_FOUND);
        }
    }

    async lookupMovieByImdbId(imdbId: string | number): Promise<Movie> {
        try {
            return await this.callApi(`${this.host}/api/v3/movie/lookup/imdb?imdbId=${imdbId}`);
        } catch (e) {
            throw new Error(REPLIES.IMDB_ID_NOT_FOUND);
        }
    }

    async downloadMovie(movie: Movie): Promise<Movie> {
        const profile = await this.callApi(`${this.host}/api/v3/qualityprofile`);
        const selectedProfile = profile.find(p => p.name === env("QUALITY_PROFILE", "Any"));
        if (!selectedProfile) {
            throw new Error(REPLIES.QUALITY_PROFILE_NOT_FOUND);
        }
        const destination = env("ROOT_FOLDER_PATH", "/downloads/movies");
        willDebug(`Adding ${movie.title} to ${destination}`);
        await this.callApi(`${this.host}/api/v3/movie`, 'POST', {
            ...movie,
            qualityProfileId: selectedProfile.id,
            rootFolderPath: destination,
            monitored: true,
            addOptions: {
                searchForMovie: true,
                addMethod: "manual",
                ignoreEpisodesWithFiles: false,
                ignoreEpisodesWithoutFiles: false,
                monitor: "movieOnly"
            },
        });
        await redis.del('radarr:movies');
        await this.getLocalMovies();
        return movie;
    }

    async downloadMovieByTmdbId(tmdbId: string | number): Promise<Movie> {
        const movie: Movie = await this.lookupMovieByTmdbId(tmdbId);
        const movies = await this.getLocalMovies();
        const existedMovie = movies.find(m => m.tmdbId === Number(tmdbId));
        if (existedMovie) {
            if (existedMovie.hasFile) {
                throw new Error(REPLIES.MOVIE_ALREADY_DOWNLOADED);
            }
            await this.callApi(`${this.host}/api/v3/command`, 'POST', {
                name: "MoviesSearch",
                movieIds: [existedMovie.id],
            });
            return movie;
        }
        return this.downloadMovie(movie);
    }

    async downloadMovieByImdbId(imdbId: string | number): Promise<Movie> {
        const movie: Movie = await this.lookupMovieByImdbId(imdbId);
        const movies = await this.getLocalMovies();
        const existedMovie = movies.find(m => m.imdbId === imdbId);
        if (existedMovie) {
            if (existedMovie.hasFile) {
                throw new Error(REPLIES.MOVIE_ALREADY_DOWNLOADED);
            }
            await this.callApi(`${this.host}/api/v3/command`, 'POST', {
                name: "MoviesSearch",
                movieIds: [existedMovie.id],
            });
            return movie;
        }
        return this.downloadMovie(movie);
    }

    async getQueueDetails(): Promise<Queue[]> {
        return this.callApi(`${this.host}/api/v3/queue/details?includeMovie=true`);
    }

    async getHistory(): Promise<any> {
        return this.callApi(`${this.host}/api/v3/history`);
    }

    async refreshMonitoredDownloads(): Promise<void> {
        await this.callApi(`${this.host}/api/v3/command`, 'POST', {
            name: "RefreshMonitoredDownloads",
        });
    }

    async deleteMovie(movieId: number, options: DeleteMovieOptions): Promise<void> {
        let url = `${this.host}/api/v3/movie/${movieId}`;
        const _options = [];
        if (get(options, 'deleteFiles')) {
            _options.push('deleteFiles=true');
        }
        if (get(options, 'addImportExclusion')) {
            _options.push('addImportExclusion=true');
        }
        willDebug(`Deleting movie ${movieId} with options ${_options.join('&')}`);
        const r = await this.callApi(`${url}?${_options.join('&')}`, 'DELETE');
        console.log(r);
        await redis.del('radarr:movies');
        await this.getLocalMovies();
    }
}

const radarr = new Radarr();
export default radarr;
