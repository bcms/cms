import { MemCache } from '@bcms/selfhosted-utils/mem-cache';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type { Client } from '@bcms/selfhosted-client/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

export class EntryStatusHandler {
    private baseUri = `/api/v4/entry-status`;
    private cache = new MemCache<EntryStatus>('_id');
    private latch: {
        [name: string]: boolean;
    } = {};

    constructor(private client: Client) {
        if (this.client.enableSocket) {
            this.client.socket.register('entry_status', async (data) => {
                if (data.type === 'update') {
                    const cacheHit = this.cache.findById(data.entryStatusId);
                    if (cacheHit) {
                        await this.getById(data.entryStatusId, true);
                    }
                } else {
                    this.cache.remove(data.entryStatusId);
                }
            });
        }
    }

    async getAll(skipCache?: boolean) {
        if (!skipCache && this.client.enableSocket && this.latch.all) {
            return this.cache.items;
        }
        const res = await this.client.send<
            ControllerItemsResponse<EntryStatus>
        >({
            url: `${this.baseUri}/all`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.items);
            this.latch.all = true;
        }
        return res.items;
    }

    async getById(id: string, skipCache?: boolean) {
        if (!skipCache && this.client.enableSocket) {
            const cacheHit = this.cache.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const res = await this.client.send<ControllerItemResponse<EntryStatus>>(
            {
                url: `${this.baseUri}/${id}`,
            },
        );
        if (this.client.useMemCache) {
            this.cache.set(res.item);
        }
        return res.item;
    }
}
