import {Telegraf, session} from "telegraf";
import HelpHandler from "./handler/help.handler";
import MeowHandler from "./handler/meow.handler";
import MoviesHandler from "./handler/movies.handler";
import initCronJobs from "./jobs";
import {env} from "./common/env";
import {saveLastUserMessageId} from "./middlewares";

export const bot = new Telegraf(env("TELEGRAM_TOKEN"));

if (env("LOG_TELEGRAF")) {
    bot.use(Telegraf.log());
}

bot.use(saveLastUserMessageId);

bot.use(session({
        defaultSession: () => ({
                localMoviesPage: 1,
                lookupMoviesPage: 1,
            }
        )
    }
));

bot.command('help', Telegraf.groupChat(HelpHandler.showGeneralHelp));
bot.command('meow', MeowHandler.meow);
bot.command('bau', MeowHandler.bauMeow);

bot.hears(/kho phim/i, Telegraf.groupChat(MoviesHandler.getLocalMovies));
bot.command('movies', Telegraf.groupChat(MoviesHandler.getLocalMovies));
bot.action(/^localMovies:(next|prev)/, Telegraf.groupChat(MoviesHandler.paginateLocalMovies));

bot.hears(/^phim (.+)$/i, Telegraf.groupChat(MoviesHandler.lookupMovies));
bot.hears(/^\/movie (.+)$/i, Telegraf.groupChat(MoviesHandler.lookupMovies));
bot.action(/^lookupMovies:(next|prev):(.*)/, Telegraf.groupChat(MoviesHandler.paginateLookupMovies));

bot.action(/^DOWNLOAD_MOVIE:(.*)/, Telegraf.groupChat(MoviesHandler.downloadMovie));
bot.action(/^DELETE_MOVIE:(.*)/, Telegraf.groupChat(MoviesHandler.deleteMovie));
bot.action(/^DELETE_MOVIE_CONFIRM:(\d):(.*)/, Telegraf.groupChat(MoviesHandler.deleteMovieConfirm));

bot.command('queue', Telegraf.groupChat(MoviesHandler.getQueueDetails));
bot.hears(/^\/tmdb ([a-z0-9]+)/, Telegraf.groupChat(MoviesHandler.searchByTmdbId));
bot.hears(/^\/imdb ([a-z0-9]+)/, Telegraf.groupChat(MoviesHandler.searchByImdbId));

bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.launch().then();
initCronJobs();
