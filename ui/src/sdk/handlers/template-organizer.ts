import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { TemplateOrganizer } from '@bcms/selfhosted-backend/template-organizer/models/main';
import type {
    TemplateOrganizerCreateBody,
    TemplateOrganizerUpdateBody,
} from '@bcms/selfhosted-backend/template-organizer/models/controller';

export class TemplateOrganizerHandler extends Handler {
    private baseUri = '/api/v4/templateOrganizer';
    private latch: {
        [key: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.sdk.socket.register('template_organizer', async (data) => {
            if (data.type === 'update') {
                await this.get({
                    templateOrganizerId: data.templateOrganizerId,
                    skipCache: true,
                });
            } else {
                this.sdk.store.templateOrganizer.remove(
                    data.templateOrganizerId,
                );
            }
        });
    }

    clear() {
        this.latch = {};
        this.sdk.store.templateOrganizer.clear();
    }

    async getAll(data?: { skipCache?: boolean }) {
        if (!data?.skipCache && this.latch.all) {
            return this.sdk.store.templateOrganizer.items();
        }
        const result = await this.sdk.send<
            ControllerItemsResponse<TemplateOrganizer>
        >({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.templateOrganizer.set(result.items);
        this.latch.all = true;
        return result.items;
    }

    async get(data: { templateOrganizerId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.templateOrganizer.findById(
                data.templateOrganizerId,
            );
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<
            ControllerItemResponse<TemplateOrganizer>
        >({
            url: `${this.baseUri}/${data.templateOrganizerId}`,
        });
        this.sdk.store.templateOrganizer.set(result.item);
        return result.item;
    }

    async create(data: TemplateOrganizerCreateBody) {
        const result = await this.sdk.send<
            ControllerItemResponse<TemplateOrganizer>
        >({
            url: `${this.baseUri}/create`,
            method: 'POST',
            data,
        });
        this.sdk.store.templateOrganizer.set(result.item);
        return result.item;
    }

    async update(data: TemplateOrganizerUpdateBody) {
        const result = await this.sdk.send<
            ControllerItemResponse<TemplateOrganizer>
        >({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.templateOrganizer.set(result.item);
        return result.item;
    }

    async deleteById(data: { templateOrganizerId: string }) {
        const result = await this.sdk.send<
            ControllerItemResponse<TemplateOrganizer>
        >({
            url: `${this.baseUri}/${data.templateOrganizerId}`,
            method: 'DELETE',
        });
        this.sdk.store.templateOrganizer.remove(result.item._id);
        return result.item;
    }
}
