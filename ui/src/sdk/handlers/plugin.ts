import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type { PluginList } from '@bcms/selfhosted-backend/plugin/models/controller';

export class PluginHandler extends Handler {
    private baseUri = `/api/v4/plugin`;

    constructor(private sdk: Sdk) {
        super();
    }

    clear() {
        // Do nothing
    }

    async getAll() {
        return await this.sdk.send<PluginList>({
            url: `${this.baseUri}/all`,
        });
    }
}
