import { Handler } from '@bcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@bcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import type { LanguageCreateBody } from '@bcms/selfhosted-backend/language/models/controller';

export class LanguageHandler extends Handler {
    private baseUri = '/api/v4/language';
    private unsubs: Array<() => void> = [];
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('language', async (data) => {
                if (data.type === 'update') {
                    await this.get({
                        languageId: data.languageId,
                        skipCache: true,
                    });
                } else {
                    this.sdk.store.language.remove(data.languageId);
                }
            }),
        );
    }

    clear() {
        this.latch = {};
        this.sdk.store.language.remove(
            this.sdk.store.language.items().map((e) => e._id),
        );
        this.unsubs.forEach((e) => e());
        this.unsubs = [];
    }

    async getAll(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.all) {
            return this.sdk.store.language.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<Language>>({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.language.set(result.items);
        this.latch.all = true;
        return result.items;
    }

    async get(data: { languageId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.language.findById(data.languageId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Language>>({
            url: `${this.baseUri}/${data.languageId}`,
        });
        this.sdk.store.language.set(result.item);
        return result.item;
    }

    async create(data: LanguageCreateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Language>>({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.language.set(result.item);
        return result.item;
    }

    async deleteById(data: { languageId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<Language>>({
            url: `${this.baseUri}/${data.languageId}`,
            method: 'DELETE',
        });
        this.sdk.store.language.remove(result.item._id);
        return result.item;
    }
}
