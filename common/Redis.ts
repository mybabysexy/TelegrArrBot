import {createClient, RedisClientType, RedisDefaultModules} from 'redis';
import {env} from "./env";

class RedisClass {
    private client: RedisClientType<RedisDefaultModules>;
    constructor() {
        const password = process.env.REDIS_PASSWORD;
        const host = process.env.REDIS_HOST || 'localhost';
        const port = process.env.REDIS_PORT || '6379';

        if (password) {
            this.client = createClient({
                url: `redis://${host}:${port}`,
                password,
                socket: {
                    connectTimeout: 10000,
                },
                pingInterval: 3000,
            });
        } else {
            this.client = createClient({
                url: `redis://${host}:${port}`,
                socket: {
                    connectTimeout: 10000,
                },
                pingInterval: 3000,
            });
        }

        this.client.connect()
            .then(() => {
                console.log('Redis connected');
            })
            .catch(err => {
                console.log('Redis connection error', err);
            });
    }

    async flash(key, value, ttl) {
        try {
            const stringified = JSON.stringify(value);
            return this.client.set(key, stringified, {
                EX: ttl,
            });
        } catch (e) {
            return false;
        }
    }

    async lock(key, ttl) {
        try {
            const stringified = JSON.stringify(true);
            const res = await this.client.set(key, stringified, {
                EX: ttl,
                NX: true,
            });
            return res === 'OK';
        } catch (e) {
            return false;
        }
    }

    async set(key, value) {
        try {
            const stringified = JSON.stringify(value);
            const ttl = env('CACHE_TTL', 60 * 15); // 15 minutes
            return this.client.set(key, stringified, {
                EX: ttl,
            });
        } catch (e) {
            return false;
        }
    }

    async get(key, defaultValue = null) {
        try {
            const value = await this.client.get(key);
            if (value) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    console.log(e)
                    return value;
                }
            }
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        } catch (e) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }

    async forget(key) {
        try {
            return this.client.del(key);
        } catch (e) {
            return false;
        }
    }

    async del(key) {
        try {
            return this.forget(key);
        } catch (e) {
            return false;
        }
    }
}

const Redis = new RedisClass();
export default Redis;
