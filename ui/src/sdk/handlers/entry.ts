import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@thebcms/selfhosted-backend/util/controller';
import type {
    Entry,
    EntryLite,
    EntryParsed,
} from '@thebcms/selfhosted-backend/entry/models/main';
import type {
    EntryCreateBody,
    EntryUpdateBody,
} from '@thebcms/selfhosted-backend/entry/models/controller';

export class EntryHandler extends Handler {
    private baseUri = '/api/v4/template';
    private unsubs: Array<() => void> = [];
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('entry', async (data) => {
                if (data.type === 'update') {
                    const cacheHit = this.sdk.store.entry.findById(
                        data.entryId,
                    );
                    if (cacheHit) {
                        await this.get({
                            templateId: data.templateId,
                            entryId: data.entryId,
                            skipCache: true,
                        });
                    }
                    const liteCacheHit = this.sdk.store.entryLite.findById(
                        data.entryId,
                    );
                    if (liteCacheHit) {
                        await this.getLite({
                            templateId: data.templateId,
                            entryId: data.entryId,
                            skipCache: true,
                        });
                    }
                } else {
                    this.sdk.store.entry.remove(data.entryId);
                    this.sdk.store.entryLite.remove(data.entryId);
                }
            }),
        );
    }

    clear() {
        this.latch = {};
        this.sdk.store.entry.remove(
            this.sdk.store.entry.items().map((e) => e._id),
        );
        this.sdk.store.entryLite.remove(
            this.sdk.store.entryLite.items().map((e) => e._id),
        );
        this.unsubs.forEach((e) => e());
        this.unsubs = [];
    }

    async getAllByTemplateId(data: {
        templateId: string;
        skipCache?: boolean;
    }) {
        if (!data.skipCache && this.latch[data.templateId]) {
            return this.sdk.store.entry.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<Entry>>({
            url: `${this.baseUri}/${data.templateId}/entry/all`,
        });
        this.sdk.store.entry.set(result.items);
        this.latch[data.templateId] = true;
        return result.items;
    }

    async getAllParsedByTemplateId(data: { templateId: string }) {
        const result = await this.sdk.send<
            ControllerItemsResponse<EntryParsed>
        >({
            url: `${this.baseUri}/${data.templateId}/entry/all/parsed`,
        });
        return result.items;
    }

    async getAllLite(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.lite_all) {
            return this.sdk.store.entryLite.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<EntryLite>>({
            url: `${this.baseUri}/entry/all/lite`,
        });
        this.sdk.store.entryLite.set(result.items);
        this.latch.lite_all = true;
        return result.items;
    }

    async getAllLiteByTemplateId(data: {
        templateId: string;
        skipCache?: boolean;
    }) {
        if (
            !data.skipCache &&
            (this.latch['lite_' + data.templateId] || this.latch.lite_all)
        ) {
            return this.sdk.store.entryLite.findMany(
                (e) => e.templateId === data.templateId,
            );
        }
        const result = await this.sdk.send<ControllerItemsResponse<EntryLite>>({
            url: `${this.baseUri}/${data.templateId}/entry/all/lite`,
        });
        this.sdk.store.entryLite.set(result.items);
        this.latch['lite_' + data.templateId] = true;
        return result.items;
    }

    async get(data: {
        entryId: string;
        templateId: string;
        skipCache?: boolean;
    }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.entry.findById(data.entryId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Entry>>({
            url: `${this.baseUri}/${data.templateId}/entry/${data.entryId}`,
        });
        this.sdk.store.entry.set(result.item);
        return result.item;
    }

    async getParsed(data: { entryId: string; templateId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<EntryParsed>>(
            {
                url: `${this.baseUri}/${data.templateId}/entry/${data.entryId}/parsed`,
            },
        );
        return result.item;
    }

    async getLite(data: {
        entryId: string;
        templateId: string;
        skipCache?: boolean;
    }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.entryLite.findById(data.entryId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<EntryLite>>({
            url: `${this.baseUri}/${data.templateId}/entry/${data.entryId}/lite`,
        });
        this.sdk.store.entryLite.set(result.item);
        return result.item;
    }

    async create(data: { data: EntryCreateBody; templateId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<Entry>>({
            url: `${this.baseUri}/${data.templateId}/entry/create`,
            method: 'POST',
            data: data.data,
        });
        this.sdk.store.entry.set(result.item);
        await this.getLite({
            entryId: result.item._id,
            templateId: result.item.templateId,
            skipCache: true,
        });
        return result.item;
    }

    async update(data: EntryUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Entry>>({
            url: `${this.baseUri}/${data.templateId}/entry/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.entry.set(result.item);
        await this.getLite({
            entryId: result.item._id,
            templateId: result.item.templateId,
            skipCache: true,
        });
        return result.item;
    }

    async deleteById(data: { entryId: string; templateId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<Entry>>({
            url: `${this.baseUri}/${data.templateId}/entry/${data.entryId}`,
            method: 'DELETE',
        });
        this.sdk.store.entry.remove(result.item._id);
        this.sdk.store.entryLite.remove(result.item._id);
        return result.item;
    }
}
