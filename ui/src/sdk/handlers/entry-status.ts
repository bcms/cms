import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type {
    EntryStatusCreateBody,
    EntryStatusUpdateBody,
} from '@bcms/selfhosted-backend/entry-status/models/controller';

export class EntryStatusHandler extends Handler {
    private baseUri = '/api/v4/entry-status';
    private unsubs: Array<() => void> = [];
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('entry_status', async (data) => {
                if (data.type === 'update') {
                    await this.get({
                        entryStatusId: data.entryStatusId,
                        skipCache: true,
                    });
                } else {
                    this.sdk.store.entryStatus.remove(data.entryStatusId);
                }
            }),
        );
    }

    clear() {
        this.latch = {};
        this.sdk.store.entryStatus.clear();
        this.unsubs.forEach((e) => e());
        this.unsubs = [];
    }

    async getAll(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.all) {
            return this.sdk.store.entryStatus.items();
        }
        const result = await this.sdk.send<
            ControllerItemsResponse<EntryStatus>
        >({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.entryStatus.set(result.items);
        this.latch.all = true;
        return result.items;
    }

    async get(data: { entryStatusId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.entryStatus.findById(
                data.entryStatusId,
            );
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<EntryStatus>>(
            {
                url: `${this.baseUri}/${data.entryStatusId}`,
            },
        );
        this.sdk.store.entryStatus.set(result.item);
        return result.item;
    }

    async create(data: EntryStatusCreateBody) {
        const result = await this.sdk.send<ControllerItemResponse<EntryStatus>>(
            {
                url: `${this.baseUri}/create`,
                method: 'POST',
                data,
            },
        );
        this.sdk.store.entryStatus.set(result.item);
        return result.item;
    }

    async update(data: EntryStatusUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<EntryStatus>>(
            {
                url: `${this.baseUri}/update`,
                method: 'PUT',
                data,
            },
        );
        this.sdk.store.entryStatus.set(result.item);
        return result.item;
    }

    async deleteById(data: { entryStatusId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<EntryStatus>>(
            {
                url: `${this.baseUri}/${data.entryStatusId}`,
                method: 'DELETE',
            },
        );
        this.sdk.store.entryStatus.remove(result.item._id);
        return result.item;
    }
}
