import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    WidgetCreateBody,
    WidgetUpdateBody,
    WidgetWhereIsItUsedResult,
} from '@bcms/selfhosted-backend/widget/models/controller';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';

export class WidgetHandler extends Handler {
    private baseUri = '/api/v4/widget';
    private unsubs: Array<() => void> = [];
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('widget', async (data) => {
                if (data.type === 'update') {
                    await this.get({
                        widgetId: data.widgetId,
                        skipCache: true,
                    });
                } else {
                    this.sdk.store.widget.remove(data.widgetId);
                }
            }),
        );
    }

    clear() {
        this.latch = {};
        this.sdk.store.widget.remove(
            this.sdk.store.widget.items().map((e) => e._id),
        );
        this.unsubs.forEach((e) => e());
        this.unsubs = [];
    }

    async whereIsItUsed(data: { widgetId: string }) {
        return await this.sdk.send<WidgetWhereIsItUsedResult>({
            url: `${this.baseUri}/${data.widgetId}/where-is-it-used`,
        });
    }

    async getAll(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.all) {
            return this.sdk.store.widget.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<Widget>>({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.widget.set(result.items);
        this.latch.all = true;
        return result.items;
    }

    async get(data: { widgetId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.widget.findById(data.widgetId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Widget>>({
            url: `${this.baseUri}/${data.widgetId}`,
        });
        this.sdk.store.widget.set(result.item);
        return result.item;
    }

    async create(data: WidgetCreateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Widget>>({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.widget.set(result.item);
        return result.item;
    }

    async update(data: WidgetUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Widget>>({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.widget.set(result.item);
        return result.item;
    }

    async deleteById(data: { widgetId: string }) {
        const result = await this.sdk.send<ControllerItemResponse<Widget>>({
            url: `${this.baseUri}/${data.widgetId}`,
            method: 'DELETE',
        });
        this.sdk.store.widget.remove(result.item._id);
        return result.item;
    }
}
