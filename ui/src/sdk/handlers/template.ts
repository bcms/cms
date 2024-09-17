import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { createQueue, QueueError } from '@bcms/selfhosted-utils/queue';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    TemplateCreateBody,
    TemplateUpdateBody,
    TemplateWhereIsItUsedResult,
} from '@bcms/selfhosted-backend/template/models/controller';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

export class TemplateHandler extends Handler {
    private baseUri = '/api/v4/template';
    private getAllQueue = createQueue<Template[]>();
    private unsubs: Array<() => void> = [];
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('template', async (data) => {
                if (data.type === 'update') {
                    await this.get({
                        templateId: data.templateId,
                        skipCache: true,
                    });
                } else {
                    this.sdk.store.template.remove(data.templateId);
                }
            }),
        );
    }

    clear() {
        this.latch = {};
        this.sdk.store.template.remove(
            this.sdk.store.template.items().map((e) => e._id),
        );
        this.unsubs.forEach((e) => e());
        this.unsubs = [];
    }

    async whereIsItUsed(data: { templateId: string }) {
        return await this.sdk.send<TemplateWhereIsItUsedResult>({
            url: `${this.baseUri}/${data.templateId}/where-is-it-used`,
        });
    }

    async getAll(data?: { skipCache?: boolean }) {
        const queue = await this.getAllQueue({
            name: 'getAll',
            handler: async () => {
                if (!data?.skipCache && this.latch.all) {
                    return this.sdk.store.template.items();
                }
                const result = await this.sdk.send<
                    ControllerItemsResponse<Template>
                >({
                    url: `${this.baseUri}/all`,
                });
                this.sdk.store.template.set(result.items);
                this.latch.all = true;
                return result.items;
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
        return queue.data;
    }

    async get(data: { templateId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.template.findById(data.templateId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Template>>({
            url: `${this.baseUri}/${data.templateId}`,
        });
        this.sdk.store.template.set(result.item);
        return result.item;
    }

    async create(data: TemplateCreateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Template>>({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.template.set(result.item);
        return result.item;
    }

    async update(data: TemplateUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Template>>({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.template.set(result.item);
        return result.item;
    }

    async deleteById(data: { templateId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<Template>>({
            url: `${this.baseUri}/${data.templateId}`,
            method: 'DELETE',
        });
        this.sdk.store.template.remove(result.item._id);
        return result.item;
    }
}
