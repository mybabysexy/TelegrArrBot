export interface Movie {
    id: number;
    title: string;
    studio: string;
    certification: string;
    overview: string;
    remotePoster: string;
    year: number;
    hasFile: boolean;
    imdbId: string;
    tmdbId: number;
    genres: Array<string>;
    images: Array<{
        coverType: string;
        url: string;
        remoteUrl: string;
    }>;
    folder: string;
    folderName: string;
    monitored: boolean;
}

export interface Queue {
    movieId: number;
    size: number;
    title: string;
    sizeleft: number;
    timeleft: string;
    estimatedCompletionTime: string;
    status: string;
    trackedDownloadStatus: string;
    trackedDownloadState: string;
    downloadId: string;
    protocol: string;
    downloadClient: string;
    indexer: string;
    outputPath: string;
    id: number;
    movie: Movie;
    quality: {
        quality: {
            id: number;
            name: string;
            source: string;
            resolution: string;
            modifier: string;
        },
        revision: {
            version: number;
            real: number;
            isRepack: boolean;
        }
    }
}

export interface DeleteMovieOptions {
    deleteFiles: boolean; // Delete the movie files from disk
    addImportExclusion: boolean; // Prevent movie from being added to Radarr by lists
}
