import {moviesQueueReplyBuilder, willDebug} from "../common/functions";
import {env} from "../common/env";
import {size} from "lodash";
import {bot} from "../index";
import Radarr from "../common/Radarr";
import redis from "../common/Redis";

class GetQueueDetail {
    cronExpr: any;
    name: string;

    constructor(cronExpr) {
        this.cronExpr = cronExpr;
        this.name = 'Monitor Downloads';
    }

    async handle() {
        try {
            await Radarr.refreshMonitoredDownloads();
            const message = await moviesQueueReplyBuilder();
            const lastQueueMessageId = await redis.get(`last_queue_message_id:${env("TELEGRAM_CHAT_ID")}`);
            const lastUserMessageId = await redis.get(`last_user_message_id:${env("TELEGRAM_CHAT_ID")}`);
            if (size(message) > 0) {
                // Edit last queue announcement message if it is the last message in chat
                if (Number(lastQueueMessageId) > Number(lastUserMessageId)) {
                    await bot.telegram.editMessageText(env("TELEGRAM_CHAT_ID"), lastQueueMessageId, null, message, {
                        parse_mode: "HTML",
                    });
                    await redis.set(`last_queue_message_id:${env("TELEGRAM_CHAT_ID")}`, lastQueueMessageId);
                } else {
                    const {message_id} = await bot.telegram.sendMessage(env("TELEGRAM_CHAT_ID"), message, {
                        parse_mode: "HTML",
                        disable_notification: true,
                    });
                    await redis.set(`last_queue_message_id:${env("TELEGRAM_CHAT_ID")}`, message_id);
                }
            }
        } catch (e) {
            willDebug(e);
        }
    }
}

export default GetQueueDetail;
