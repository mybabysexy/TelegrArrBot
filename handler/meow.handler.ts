import {Context} from "telegraf";
import {random} from "lodash";
import {MEOWS, ML_BAU} from "../common/constants";

class MeowHandler {
    meow(ctx: Context) {
        const selected = MEOWS[random(0, MEOWS.length - 1)];
        switch (selected.type) {
            case "html":
                return ctx.replyWithHTML(selected.value);
            case "sticker":
                return ctx.replyWithSticker(selected.value);
            default:
                return ctx.reply(selected.value);
        }
    }

    bauMeow(ctx: Context) {
        const sticker = ML_BAU[random(0, ML_BAU.length - 1)];
        return ctx.replyWithSticker(sticker);
    }
}

const meowHandler = new MeowHandler();
export default meowHandler;
