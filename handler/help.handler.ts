import {Context} from "telegraf";

class HelpHandler {
    showGeneralHelp(ctx: Context) {
        const COMMANDS = [
            `<code>/meow - Meow 😺</code>`,
            `<code>/bau - Meow 😺</code>`,
            '',
            `<code>kho phim - View Movies Library</code>`,
            `<code>/movies - View Movies Library</code>`,
            '',
            `<code>phim [keyword] - Lookup movies</code>`,
            `<code>/movie [keyword] - Lookup movies</code>`,
            `<code>/imdb [id] - Lookup movie by IMDB ID</code>`,
            `<code>/tmdb [id] - Lookup movie by TMDB ID</code>`,
            '',
            `<code>/queue - View queue status</code>`,
            '',
            `<code>/help - Show this help duh</code>`,
        ];
        return ctx.replyWithHTML(`<b>Available commands:</b>\n${COMMANDS.join("\n")}`);
    }
}

const helpHandler = new HelpHandler();
export default helpHandler;
