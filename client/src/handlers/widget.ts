import { MemCache } from '@bcms/selfhosted-utils/mem-cache';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { Client } from '@bcms/selfhosted-client/main';
import type { WidgetWhereIsItUsedResult } from '@bcms/selfhosted-backend/widget/models/controller';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

export class WidgetHandler {
    private baseUri = `/api/v4/widget`;
    private cache = new MemCache<Widget>('_id');
    private latch: {
        [name: string]: boolean;
    } = {};

    constructor(private client: Client) {
        if (this.client.enableSocket) {
            this.client.socket.register('widget', async (data) => {
                if (data.type === 'update') {
                    const cacheHit = this.cache.findById(data.widgetId);
                    if (cacheHit) {
                        await this.getById(data.widgetId, true);
                    }
                } else {
                    this.cache.remove(data.widgetId);
                }
            });
        }
    }

    async whereIsItUsed(id: string) {
        return await this.client.send<WidgetWhereIsItUsedResult>({
            url: `${this.baseUri}/${id}/where-is-it-used`,
        });
    }

    async getAll(skipCache?: boolean) {
        if (!skipCache && this.client.useMemCache && this.latch.all) {
            return this.cache.items;
        }
        const res = await this.client.send<ControllerItemsResponse<Widget>>({
            url: `${this.baseUri}/all`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.items);
            this.latch.all = true;
        }
        return res.items;
    }

    async getById(id: string, skipCache?: boolean) {
        if (!skipCache && this.client.useMemCache) {
            const cacheHit = this.cache.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const res = await this.client.send<ControllerItemResponse<Widget>>({
            url: `${this.baseUri}/${id}`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.item);
        }
        return res.item;
    }
}
