import { MemCache } from '@bcms/selfhosted-utils/mem-cache';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import type { Client } from '@bcms/selfhosted-client/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

/**
 * A handler class for interfacing with the language-related API endpoints.
 */
export class LanguageHandler {
    private baseUri = `/api/v4/language`;
    private cache = new MemCache<Language>('_id');
    private latch: {
        [name: string]: boolean;
    } = {};

    constructor(private client: Client) {
        if (this.client.enableSocket) {
            this.client.socket.register('language', async (data) => {
                if (data.type === 'update') {
                    const cacheHit = this.cache.findById(data.languageId);
                    if (cacheHit) {
                        await this.getById(data.languageId, true);
                    }
                } else {
                    this.cache.remove(data.languageId);
                }
            });
        }
    }

    /**
     * Retrieves all languages
     *
     * @param {boolean} [skipCache] - Indicates whether to skip the cache and fetch data directly.
     * @return {Promise<Language>} A promise that resolves to an array of items.
     */
    async getAll(skipCache?: boolean): Promise<Language[]> {
        if (!skipCache && this.client.useMemCache && this.latch.all) {
            return this.cache.items;
        }
        const res = await this.client.send<ControllerItemsResponse<Language>>({
            url: `${this.baseUri}/all`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.items);
        }
        return res.items;
    }

    /**
     * Retrieves a Language object by its ID.
     *
     * @param {string} id - The unique identifier of the Language object to retrieve.
     * @param {boolean} [skipCache=false] - Whether to bypass the cache and fetch data directly (default is false).
     * @return {Promise<Language>} A promise that resolves to the requested Language object.
     */
    async getById(id: string, skipCache?: boolean): Promise<Language> {
        if (!skipCache && this.client.useMemCache) {
            const cacheHit = this.cache.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const res = await this.client.send<ControllerItemResponse<Language>>({
            url: `${this.baseUri}/${id}`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.item);
        }
        return res.item;
    }
}
