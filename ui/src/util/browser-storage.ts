import { v4 as uuidv4 } from 'uuid';
import type {
    SdkStorage,
    StorageSubscriptionHandler,
} from '@thebcms/selfhosted-sdk';

interface LocalStorageWrapper {
    all<T>(): T;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

function createLocalStorageWrapper(): LocalStorageWrapper {
    if (typeof localStorage !== 'undefined') {
        return {
            all() {
                return JSON.parse(JSON.stringify(localStorage));
            },
            getItem(key) {
                return localStorage.getItem(key);
            },
            setItem(key, value) {
                localStorage.setItem(key, value);
            },
            removeItem(key) {
                localStorage.removeItem(key);
            },
        };
    }

    const _storage: {
        [key: string]: string;
    } = {};

    return {
        all() {
            return JSON.parse(JSON.stringify(_storage));
        },
        getItem(key) {
            if (_storage[key]) {
                return '' + _storage[key];
            } else {
                return null;
            }
        },
        setItem(key, value) {
            _storage[key] = '' + value;
        },
        removeItem(key) {
            delete _storage[key];
        },
    };
}

export function createStorage(config: {
    scope: string;
    chunkSize?: number;
}): SdkStorage {
    const CHUNK_SIZE = config.chunkSize || 5120000;
    const ls = createLocalStorageWrapper();
    const subs: {
        [id: string]: {
            key: string;
            handler: StorageSubscriptionHandler<unknown>;
        };
    } = {};

    const self: SdkStorage = {
        async clear() {
            const items: { [key: string]: unknown } = ls.all();
            const keys = Object.keys(items);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key.startsWith(config.scope)) {
                    await self.remove(key.substring(config.scope.length + 1));
                }
            }
        },
        async set(key, value) {
            const keyBase = `${config.scope}_${key}`;
            try {
                let data = '';
                if (typeof value === 'object') {
                    data = JSON.stringify(value);
                } else if (typeof value === 'string') {
                    data = value as string;
                } else {
                    // eslint-disable-next-line no-console
                    console.error(
                        `Value can be only "string" or "object" but "${typeof value}" was provided.`,
                    );
                    return false;
                }
                let chunked = false;
                let chunkCount = 0;
                if (data.length > CHUNK_SIZE) {
                    chunked = true;
                    chunkCount =
                        parseInt(`${data.length / CHUNK_SIZE}`, 10) + 1;
                    for (let i = 0; i < chunkCount; i++) {
                        ls.setItem(
                            `${keyBase}_chunk_${i}`,
                            data.substring(
                                i * CHUNK_SIZE,
                                i * CHUNK_SIZE + CHUNK_SIZE,
                            ),
                        );
                    }
                }
                ls.setItem(
                    keyBase,
                    chunked ? JSON.stringify({ ____chunks: chunkCount }) : data,
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
                return false;
            }
            const ids = Object.keys(subs);
            for (let i = 0; i < ids.length; i++) {
                const sub = subs[ids[i]];
                if (sub.key === key) {
                    await sub.handler(JSON.parse(JSON.stringify(value)), 'set');
                }
            }
            return true;
        },
        async remove(key) {
            const keyBase = `${config.scope}_${key}`;

            const item = ls.getItem(keyBase);
            if (item) {
                try {
                    const data = JSON.parse(item);
                    if (data.____chunks) {
                        for (let i = 0; i < data.____chunks; i++) {
                            ls.removeItem(`${keyBase}_chunk_${i}`);
                        }
                    }
                } catch (error) {
                    // Do nothing
                }
            }
            ls.removeItem(keyBase);
            const ids = Object.keys(subs);
            for (let i = 0; i < ids.length; i++) {
                const sub = subs[ids[i]];
                if (sub.key === key) {
                    await sub.handler(null, 'remove');
                }
            }
        },
        get(key) {
            const keyBase = `${config.scope}_${key}`;
            const rawValue = ls.getItem(keyBase);
            if (rawValue) {
                try {
                    const data = JSON.parse(rawValue);
                    if (data.____chunks) {
                        let buffer = '';
                        for (let i = 0; i < data.____chunks; i++) {
                            const chunk = ls.getItem(`${keyBase}_chunk_${i}`);
                            buffer += chunk;
                        }
                        try {
                            return JSON.parse(buffer);
                        } catch (error) {
                            // eslint-disable-next-line no-console
                            console.error(error);
                            return buffer;
                        }
                    } else {
                        return data;
                    }
                } catch (e) {
                    return rawValue;
                }
            }
            return undefined;
        },
        subscribe(key, handler) {
            const id = uuidv4();
            subs[id] = { key, handler: handler as never };
            return () => {
                delete subs[id];
            };
        },
    };
    return self;
}
