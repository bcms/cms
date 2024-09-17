import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    GroupCreateBody,
    GroupUpdateBody,
    GroupWhereIsItUsedResult,
} from '@bcms/selfhosted-backend/group/models/controller';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';

export class GroupHandler extends Handler {
    private baseUri = '/api/v4/group';
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.sdk.socket.register('group', async (data) => {
            if (data.type === 'update') {
                await this.get({
                    groupId: data.groupId,
                    skipCache: true,
                });
            } else {
                this.sdk.store.group.remove(data.groupId);
            }
        });
    }

    clear() {
        this.latch = {};
        this.sdk.store.group.clear();
    }

    async whereIsItUsed(data: { groupId: string }) {
        return await this.sdk.send<GroupWhereIsItUsedResult>({
            url: `${this.baseUri}/${data.groupId}/where-is-it-used`,
        });
    }

    async getAll(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.all) {
            return this.sdk.store.group.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<Group>>({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.group.set(result.items);
        this.latch.all = true;
        return result.items;
    }

    async get(data: { groupId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.group.findById(data.groupId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Group>>({
            url: `${this.baseUri}/${data.groupId}`,
        });
        this.sdk.store.group.set(result.item);
        return result.item;
    }

    async create(data: GroupCreateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Group>>({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.group.set(result.item);
        return result.item;
    }

    async update(data: GroupUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Group>>({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.group.set(result.item);
        return result.item;
    }

    async deleteById(data: { groupId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<Group>>({
            url: `${this.baseUri}/${data.groupId}`,
            method: 'DELETE',
        });
        this.sdk.store.group.remove(result.item._id);
        return result.item;
    }
}
