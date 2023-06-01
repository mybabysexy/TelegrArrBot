import redis from "../common/Redis";
import {get} from "lodash";

export const saveLastUserMessageId = async (ctx, next) => {
    const id = get(ctx, 'update.message.message_id', get(ctx, 'update.callback_query.message.message_id'));
    await redis.set(`last_user_message_id:${ctx.chat.id}`, id);
    next();
}
