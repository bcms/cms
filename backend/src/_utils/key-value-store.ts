export interface KeyValueStoreItem {
    value: string;
    expAt: number;
}

export class KeyValueStore {
    private interval: NodeJS.Timeout;
    items: {
        [key: string]: KeyValueStoreItem;
    } = {};

    constructor() {
        this.interval = setInterval(() => {
            this.clear();
        }, 1000);
    }

    private clear() {
        const removeKeys: string[] = [];
        for (const key in this.items) {
            if (this.items[key].expAt < Date.now()) {
                removeKeys.push(key);
            }
        }
        for (let i = 0; i < removeKeys.length; i++) {
            const key = removeKeys[i];
            if (this.items[key]) {
                delete this.items[key];
            }
        }
    }

    set(
        key: string,
        value: string,
        options?: {
            expIn?: number;
        },
    ) {
        let expIn = Date.now();
        if (options && options.expIn) {
            expIn = options.expIn * 1000;
        }
        this.items[key] = {
            expAt: Date.now() + expIn,
            value,
        };
    }

    get(key: string): string | null {
        return this.items[key] ? this.items[key].value : null;
    }

    getDel(key: string): string | null {
        const value = this.items[key] ? this.items[key].value : null;
        if (value) {
            delete this.items[key];
        }
        return value;
    }

    mGet(keys: string[]): string[] {
        const output: string[] = [];
        for (const key in this.items) {
            if (keys.includes(key)) {
                output.push(this.items[key].value);
            }
        }
        return output;
    }

    del(key: string) {
        if (this.items[key]) {
            delete this.items[key];
        }
    }

    keys(startsWith: string): string[] {
        const output: string[] = [];
        for (const key in this.items) {
            if (key.startsWith(startsWith)) {
                output.push(key);
            }
        }
        return output;
    }

    destroy() {
        this.items = {};
        clearInterval(this.interval);
    }
}
