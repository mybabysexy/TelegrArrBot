import Radarr from "../common/Radarr";
import {find, get, size} from "lodash";
import {moviesQueueReplyBuilder, moviesReplyBuilder} from "../common/functions";
import {REPLIES} from "../common/constants";
import redis from "../common/Redis";
import {Markup} from "telegraf";
import {DeleteMovieOptions} from "../common/types";

class MoviesHandler {
    async getLocalMovies(ctx) {
        try {
            await ctx.sendChatAction("typing");
            ctx.session.localMoviesPage = 1;
            const movies = await Radarr.getLocalMovies();
            const [
                message,
                extras,
            ] = moviesReplyBuilder('localMovies', movies, 1, {
                buttons: [
                    "DOWNLOAD_MOVIE", "DELETE_MOVIE",
                ],
            });
            return ctx.reply(message, extras);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async paginateLocalMovies(ctx) {
        try {
            await ctx.sendChatAction("typing");
            await ctx.answerCbQuery();
            const movies = await Radarr.getLocalMovies();
            const oldPage = get(ctx.session, "localMoviesPage", 1);
            let page;
            if (ctx.match[0] === "localMovies:next") {
                page = oldPage + 1;
            } else if (ctx.match[0] === "localMovies:prev") {
                page = oldPage - 1;
            }
            if (page > size(movies) || page < 1) {
                return ctx.answerCbQuery(REPLIES.OUT_OF_MOVIES_INDEX);
            }
            ctx.session.localMoviesPage = page;
            const [
                message,
                extras,
            ] = moviesReplyBuilder('localMovies', movies, page, {
                buttons: [
                    "DOWNLOAD_MOVIE", "DELETE_MOVIE",
                ],
            });
            return ctx.editMessageText(message, extras);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async lookupMovies(ctx) {
        try {
            await ctx.sendChatAction("typing");
            ctx.session.lookupMoviesPage = 1;
            const movieName = ctx.match[1];
            const movies = await Radarr.lookupMovies(movieName);
            if (size(movies) === 0) {
                return ctx.reply(REPLIES.NO_MOVIES_FOUND);
            }
            const [
                message,
                extras,
            ] = moviesReplyBuilder('lookupMovies', movies, 1, {
                extra_prev_button_data: movieName,
                extra_next_button_data: movieName,
                buttons: [
                    "DOWNLOAD_MOVIE", "DELETE_MOVIE",
                ],
            });
            return ctx.reply(message, extras);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async paginateLookupMovies(ctx) {
        try {
            await ctx.sendChatAction("typing");
            await ctx.answerCbQuery();
            const movieName = ctx.match[2];
            const movies = await Radarr.lookupMovies(movieName);
            const oldPage = get(ctx.session, "lookupMoviesPage", 1);
            let page;
            if (ctx.match[1] === "next") {
                page = oldPage + 1;
            } else if (ctx.match[1] === "prev") {
                page = oldPage - 1;
            }
            if (page > size(movies) || page < 1) {
                return ctx.answerCbQuery(REPLIES.OUT_OF_MOVIES_INDEX);
            }
            ctx.session.lookupMoviesPage = page;
            const [
                message,
                extras,
            ] = moviesReplyBuilder('lookupMovies', movies, page, {
                extra_prev_button_data: movieName,
                extra_next_button_data: movieName,
                buttons: [
                    "DOWNLOAD_MOVIE", "DELETE_MOVIE",
                ],
            });
            return ctx.editMessageText(message, extras);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async downloadMovie(ctx) {
        try {
            await ctx.sendChatAction("typing");
            await ctx.answerCbQuery();
            const tmdbId = ctx.match[1];
            const movie = await Radarr.downloadMovieByTmdbId(tmdbId);
            const message = `Đã thêm ${movie.title} vào hàng đợi tải về!`;
            return ctx.reply(message);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async deleteMovie(ctx) {
        try {
            await ctx.sendChatAction("typing");
            await ctx.answerCbQuery();
            const id = ctx.match[1];
            const movies = await Radarr.getLocalMovies();
            const movie = find(movies, {id: Number(id)});
            const actionButtons = [
                Markup.button.callback("Chỉ xoá khỏi thư viện", `DELETE_MOVIE_CONFIRM:1:${id}`),
                Markup.button.callback("Xoá khỏi thư viện và xoá file", `DELETE_MOVIE_CONFIRM:2:${id}`),
                Markup.button.callback("Xoá và chặn phim này", `DELETE_MOVIE_CONFIRM:3:${id}`),
            ];
            return ctx.reply(`Bạn muốn xoá phim <b>${movie.title}</b> như thế nào?`, {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard(actionButtons, {columns: 1}),
            });
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async deleteMovieConfirm(ctx) {
        try {
            await ctx.sendChatAction("typing");
            await ctx.answerCbQuery();
            const type = ctx.match[1];
            const id = ctx.match[2];
            const options: DeleteMovieOptions = {
                deleteFiles: false,
                addImportExclusion: false,
            };
            switch (type) {
                case "1":
                    options.deleteFiles = false;
                    options.addImportExclusion = false;
                    break;
                case "2":
                    options.deleteFiles = true;
                    options.addImportExclusion = false;
                    break;
                case "3":
                    options.deleteFiles = true;
                    options.addImportExclusion = true;
                    break;
                default:
                    break;
            }
            await Radarr.deleteMovie(id, options);
            return ctx.reply("Đã xoá phim thành công!");
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async getQueueDetails(ctx) {
        try {
            await ctx.sendChatAction("typing");
            await redis.del('radarr:movies');
            await Radarr.refreshMonitoredDownloads();
            const message = await moviesQueueReplyBuilder();
            if (!message) {
                return ctx.reply(REPLIES.NO_MOVIES_IN_QUEUE);
            }
            const {message_id} = await ctx.replyWithHTML(message);
            await redis.set(`last_queue_message_id:${ctx.chat.id}`, message_id);
            return true;
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async searchByTmdbId(ctx) {
        try {
            await ctx.sendChatAction("typing");
            const tmdbId = ctx.match[1];
            const movie = await Radarr.lookupMovieByTmdbId(tmdbId);
            // API Bug: hasFile field not right, so we need to check manually
            const localMovies = await Radarr.getLocalMovies();
            const localMovie = find(localMovies, {tmdbId: Number(tmdbId)});
            movie.hasFile = get(localMovie, "hasFile", false);
            const [
                message,
                extras,
            ] = moviesReplyBuilder('lookupMovies', [movie], 1, {
                buttons: [
                    "DOWNLOAD_MOVIE", "DELETE_MOVIE",
                ],
            });
            return ctx.reply(message, extras);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }

    async searchByImdbId(ctx) {
        try {
            await ctx.sendChatAction("typing");
            const imdbId = ctx.match[1];
            const movie = await Radarr.lookupMovieByImdbId(imdbId);
            // API Bug: hasFile field not right, so we need to check manually
            const localMovies = await Radarr.getLocalMovies();
            const localMovie = find(localMovies, {imdbId});
            movie.hasFile = get(localMovie, "hasFile", false);
            const [
                message,
                extras,
            ] = moviesReplyBuilder('lookupMovies', [movie], 1, {
                buttons: [
                    "DOWNLOAD_MOVIE", "DELETE_MOVIE",
                ],
            });
            return ctx.reply(message, extras);
        } catch (e) {
            return ctx.reply(REPLIES.ERROR(e));
        }
    }
}

const moviesHandler = new MoviesHandler();
export default moviesHandler;
