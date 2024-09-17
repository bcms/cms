import { Handler } from '@bcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@bcms/selfhosted-sdk';
import { createQueue, QueueError } from '@bcms/selfhosted-utils/queue';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type {
    UserCreateBody,
    UserStatsResponse,
    UserUpdateBody,
} from '@bcms/selfhosted-backend/user/models/controller';

export class UserHandler extends Handler {
    private baseUri = '/api/v4/user';
    private latch: {
        [name: string]: boolean | string | string[];
    } = {};
    private getAllQueue = createQueue<UserProtected[]>();

    constructor(private sdk: Sdk) {
        super();
    }

    clear() {
        this.sdk.storage.clear();
        this.latch = {};
    }

    async stats() {
        return await this.sdk.send<UserStatsResponse>({
            url: `${this.baseUri}/stats`,
        });
    }

    async getAll() {
        const queue = await this.getAllQueue({
            name: 'getAll',
            handler: async () => {
                if (this.latch.all) {
                    return this.sdk.store.user.items();
                }
                const result = await this.sdk.send<
                    ControllerItemsResponse<UserProtected>
                >({
                    url: `${this.baseUri}/all`,
                });
                this.sdk.store.user.set(result.items);
                this.latch.all = true;
                return result.items;
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
        return queue.data;
    }

    async get(id: string | 'me', skipCache?: boolean) {
        const userId = id === 'me' ? this.sdk.accessToken?.payload.userId : id;
        if (!userId) {
            throw Error('You are not logged in');
        }
        if (!skipCache) {
            const cacheHit = this.sdk.store.user.findById(userId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<
            ControllerItemResponse<UserProtected>
        >({
            url: `${this.baseUri}/${userId}`,
        });
        this.sdk.store.user.set(result.item);
        return result.item;
    }

    async create(data: UserCreateBody) {
        const result = await this.sdk.send<
            ControllerItemResponse<UserProtected>
        >({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.user.set(result.item);
        return result.item;
    }

    async update(data: UserUpdateBody) {
        const result = await this.sdk.send<
            ControllerItemResponse<UserProtected>
        >({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.user.set(result.item);
        return result.item;
    }

    async uploadAvatar(data: { userId: string; file: File }) {
        const fd = new FormData();
        fd.append('file', data.file, data.file.name);
        const res = await this.sdk.send<ControllerItemResponse<UserProtected>>({
            url: `${this.baseUri}/${data.userId}/avatar`,
            method: 'POST',
            data: fd,
        });
        this.sdk.store.user.set(res.item);
        return res.item;
    }

    async deleteById(userId: string) {
        const result = await this.sdk.send<
            ControllerItemResponse<UserProtected>
        >({
            url: `${this.baseUri}/${userId}`,
            method: 'DELETE',
        });
        this.sdk.store.user.remove(result.item._id);
        return result.item;
    }
}
