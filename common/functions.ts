import {env} from "./env";
import {difference, get, size} from "lodash";
import {Markup} from "telegraf";
import {Movie} from "./types";
import Radarr from "./Radarr";
import {BUTTON_TEXTS, QUEUE_STATUS} from "./constants";
import moment from "moment";
import redis from "./Redis";

export const slugify = (str: string) => {
    // to lower case
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    const to = "aaaaeeeeiiiioooouuuunc------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    // remove invalid chars
    str = str.replace(/[^a-z0-9 -]/g, "")
        // collapse whitespace and replace by -
        .replace(/\s+/g, "-")
        // collapse dashes
        .replace(/-+/g, "-");

    return str;
}

export const willDebug = (message: string) => {
    if (env("DEBUG")) {
        console.debug(message);
    }
}

export const moviesReplyBuilder = (type: string, movies: Array<Movie>, page: number = 1, extras = {}): [message: string, extras: object] => {
    const movie = movies[page - 1];
    const messages = [];
    const title = get(movie, "title");
    const year = get(movie, "year");
    const certification = get(movie, "certification");
    const overview = get(movie, "overview");
    const posterURL = get(movie, "images[0].remoteUrl");
    const keyboard = [];
    let prevButtonData = `${type}:prev`;
    let nextButtonData = `${type}:next`;
    if (get(extras, 'extra_prev_button_data')) {
        prevButtonData += `:${get(extras, 'extra_prev_button_data')}`;
    }
    if (get(extras, 'extra_next_button_data')) {
        nextButtonData += `:${get(extras, 'extra_next_button_data')}`;
    }
    if (page > 1) {
        keyboard.push(Markup.button.callback("<", prevButtonData));
    }
    const extraButtons = get(extras, 'buttons', []);
    if (size(extraButtons) > 0) {
        extraButtons.forEach((type) => {
            switch (type) {
                case "DOWNLOAD_MOVIE":
                    if (!get(movie, "hasFile", false)) {
                        keyboard.push(Markup.button.callback(BUTTON_TEXTS[type], `${type}:${get(movie, "tmdbId")}`));
                    }
                    break;
                case "DELETE_MOVIE":
                    if (size(get(movie, "folderName", "")) > 0) {
                        keyboard.push(Markup.button.callback(BUTTON_TEXTS[type], `${type}:${get(movie, "id")}`));
                    }
                    break;
                default:
                    break;
            }
        });
    }
    if (page < size(movies)) {
        keyboard.push(Markup.button.callback(">", nextButtonData));
    }
    messages.push(`<b>[${page}/${size(movies)}] ${title} - ${year}</b>`);
    if (size(certification) > 0) {
        messages.push(`\n${certification}`);
    }
    messages.push(`\n${overview}`);
    if (env("SHOW_POSTER_PREVIEW")) {
        messages.push(`\n<a href="${posterURL}">&#8205;</a>`);
    }
    return [
        messages.join(""),
        {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard(keyboard),
        }
    ];
}

export const moviesQueueReplyBuilder = async (): Promise<string> => {
    const messages = [];
    const previousQueueDetails = await redis.get(`radarr_queue_details`, []);
    const queueDetails = await Radarr.getQueueDetails();
    await redis.set(`radarr_queue_details`, queueDetails);
    const removed = difference(previousQueueDetails.map(item => item.movieId), queueDetails.map(item => item.movieId));
    if (size(removed) > 0) {
        const movies = await Radarr.getLocalMovies();
        removed.forEach((movieId) => {
            const existedMovie = movies.find(item => item.id === movieId);
            const queueInfo = previousQueueDetails.find(item => item.movieId === movieId);
            if (queueInfo) {
                let msg = `<b>${queueInfo.movie.title} - ${queueInfo.quality.quality.name}</b>\n`;
                if (existedMovie.hasFile) {
                    msg += `Trạng thái: <code>Đã tải xong!</code>\n`;
                } else {
                    msg += `Trạng thái: <code>Đã bị xóa!</code>\n`;
                }
                messages.push(msg);
            } else {
                messages.push(`<b>${existedMovie.title}</b>\nTrạng thái: <code>Đã bị xóa!</code>`);
            }
        });
        await redis.del('radarr:movies');
    } else if (size(queueDetails) === 0) {
        return "";
    }
    queueDetails.forEach((queueDetail) => {
        let msg = `<b>${queueDetail.movie.title} - ${queueDetail.quality.quality.name}</b>\n`;
        const status = QUEUE_STATUS[queueDetail.status.toUpperCase()];
        const percent = 100 - (queueDetail.sizeleft / queueDetail.size * 100);
        const eta = moment(queueDetail.estimatedCompletionTime).format('HH:mm:ss DD-MM-YYYY');
        msg += `Trạng thái: <code>${status || '-'}</code>\n`;
        msg += `Tiến độ: <code>${percent.toFixed(1)}%</code>\n`;
        msg += `ETA: <code>${eta}</code>\n`;
        messages.push(msg);
    });
    return messages.join("\n");
}

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
