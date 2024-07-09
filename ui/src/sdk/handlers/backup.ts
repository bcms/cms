import { Handler } from '@thebcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@thebcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@thebcms/selfhosted-backend/util/controller';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';

export class BackupHandler extends Handler {
    private baseUri = '/api/v4/backup';
    private latches: {
        [id: string]: boolean;
    } = {};

    constructor(private sdk: Sdk) {
        super();
        this.sdk.socket.register('backup', async (data) => {
            if (data.type === 'update') {
                //
            }
        });
    }

    clear() {
        //
    }

    async getAll(skipCache?: boolean) {
        if (!skipCache && this.latches.all) {
            return this.sdk.store.backup.items();
        }
        const result = await this.sdk.send<ControllerItemsResponse<Backup>>({
            url: `${this.baseUri}/all`,
        });
        this.sdk.store.backup.set(result.items);
        return result.items;
    }

    async getById(id: string, skipCache?: boolean) {
        if (!skipCache) {
            const cacheHit = this.sdk.store.backup.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Backup>>({
            url: `${this.baseUri}/${id}`,
        });
        this.sdk.store.backup.set(result.item);
        return result.item;
    }

    async download(id: string) {
        return await this.sdk.send<Buffer>({
            url: `${this.baseUri}/download/${id}.zip`,
            responseType: 'arraybuffer',
        });
    }

    async create() {
        const result = await this.sdk.send<ControllerItemResponse<Backup>>({
            url: `${this.baseUri}/create`,
            method: 'POST',
        });
        this.sdk.store.backup.set(result.item);
        return result.item;
    }

    async deleteById(id: string) {
        const result = await this.sdk.send<ControllerItemResponse<Backup>>({
            url: `${this.baseUri}/${id}`,
            method: 'DELETE',
        });
        this.sdk.store.backup.remove(result.item._id);
        return result.item;
    }
}
