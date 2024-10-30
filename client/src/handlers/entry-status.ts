import { MemCache } from '@bcms/selfhosted-utils/mem-cache';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type { Client } from '@bcms/selfhosted-client/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

/**
 * EntryStatusHandler is a class that handles the retrieval and caching of entry status information.
 * It connects to a client and optionally uses a socket to listen for real-time updates to the entry status data.
 */
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

    /**
     * Retrieves all entry statuses, optionally bypassing the cache.
     *
     * @param {boolean} [skipCache] - Optional flag to bypass the cache and fetch the entry directly from the source.
     * @return {Promise<EntryStatus[]>} - A promise that resolves to an array of entry statuses.
     */
    async getAll(skipCache?: boolean): Promise<EntryStatus[]> {
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

    /**
     * Retrieves an entry status by its unique identifier.
     *
     * @param {string} id - The unique identifier of the entry to be retrieved.
     * @param {boolean} [skipCache] - Optional flag to bypass the cache and fetch the entry directly from the source.
     * @return {Promise<EntryStatus>} A promise that resolves to the fetched entry status.
     */
    async getById(id: string, skipCache?: boolean): Promise<EntryStatus> {
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
