import { MemCache } from '@bcms/selfhosted-utils/mem-cache';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type { Client } from '@bcms/selfhosted-client/main';
import type { GroupWhereIsItUsedResult } from '@bcms/selfhosted-backend/group/models/controller';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

/**
 * Handles operations related to groups.
 *
 * This class provides methods to retrieve, cache, and manage groups by
 * interacting with an external API. It also listens to real-time updates
 * via sockets if the client has sockets enabled.
 */
export class GroupHandler {
    private baseUri = `/api/v4/group`;
    private cache = new MemCache<Group>('_id');
    private latch: {
        [name: string]: boolean;
    } = {};

    constructor(private client: Client) {
        if (this.client.enableSocket) {
            this.client.socket.register('group', async (data) => {
                if (data.type === 'update') {
                    const cacheHit = this.cache.findById(data.groupId);
                    if (cacheHit) {
                        await this.getById(data.groupId, true);
                    }
                } else {
                    this.cache.remove(data.groupId);
                }
            });
        }
    }

    /**
     * This method retrieves information on where a specified group is being used.
     *
     * @param {string} id - The unique identifier of the group to query.
     * @return {Promise<GroupWhereIsItUsedResult>} A promise that resolves to the result indicating where the item is used.
     */
    async whereIsItUsed(id: string): Promise<GroupWhereIsItUsedResult> {
        return await this.client.send<GroupWhereIsItUsedResult>({
            url: `${this.baseUri}/${id}/where-is-it-used`,
        });
    }

    /**
     * Retrieves all Group items.
     *
     * @param {boolean} [skipCache=false] - Whether to skip the cache and fetch directly from the source.
     * @return {Promise<Group[]>} A promise that resolves to an array of Group objects.
     */
    async getAll(skipCache?: boolean): Promise<Group[]> {
        if (!skipCache && this.client.useMemCache && this.latch.all) {
            return this.cache.items;
        }
        const res = await this.client.send<ControllerItemsResponse<Group>>({
            url: `${this.baseUri}/all`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.items);
            this.latch.all = true;
        }
        return res.items;
    }

    /**
     * Fetches a group by its ID.
     *
     * @param {string} id - The ID of the group to be fetched.
     * @param {boolean} [skipCache=false] - Whether to skip the cache and fetch directly from the server.
     * @return {Promise<Group>} The group object corresponding to the provided ID.
     */
    async getById(id: string, skipCache?: boolean): Promise<Group> {
        if (!skipCache && this.client.useMemCache) {
            const cacheHit = this.cache.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const res = await this.client.send<ControllerItemResponse<Group>>({
            url: `${this.baseUri}/${id}`,
        });
        if (this.client.useMemCache) {
            this.cache.set(res.item);
        }
        return res.item;
    }
}
