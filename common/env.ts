import {config} from "dotenv";

config();

export const env = (key: string, defaultValue: any = null) => {
    const value = process.env[key];

    if (!value) {
        return defaultValue;
    }

    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
}
