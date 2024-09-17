import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type {
    ApiKeyCreateBody,
    ApiKeyUpdateBody,
} from '@bcms/selfhosted-backend/api-key/models/controller';

export class ApiKeyHandler extends Handler {
    private baseUri = '/api/v4/api-key';
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.sdk.socket.register('api_key', async (data) => {
            if (data.type === 'update') {
                await this.get({
                    apiKeyId: data.apiKey,
                    skipCache: true,
                });
            } else {
                this.sdk.store.apiKey.remove(data.apiKey);
            }
        });
    }

    clear() {
        this.latch = {};
        this.sdk.store.apiKey.clear();
    }

    async getAll(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.all) {
            return this.sdk.store.apiKey.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<ApiKey>>({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.apiKey.set(result.items);
        this.latch.all = true;
        return result.items;
    }

    async get(data: { apiKeyId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.apiKey.findById(data.apiKeyId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<ApiKey>>({
            url: `${this.baseUri}/${data.apiKeyId}`,
        });
        this.sdk.store.apiKey.set(result.item);
        return result.item;
    }

    async create(data: ApiKeyCreateBody) {
        const result = await this.sdk.send<ControllerItemResponse<ApiKey>>({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.apiKey.set(result.item);
        return result.item;
    }

    async update(data: ApiKeyUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<ApiKey>>({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.apiKey.set(result.item);
        return result.item;
    }

    async deleteById(data: { apiKeyId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<ApiKey>>({
            url: `${this.baseUri}/${data.apiKeyId}`,
            method: 'DELETE',
        });
        this.sdk.store.apiKey.remove(result.item._id);
        return result.item;
    }
}
