import { Handler } from '@bcms/selfhosted-sdk/handlers/_handler';
import { Sdk } from '@bcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type { Backup } from '@bcms/selfhosted-backend/backup/models/main';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@bcms/selfhosted-ui/util/sub';
import type { AxiosProgressEvent } from 'axios';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type { MediaRequestUploadTokenResult } from '@bcms/selfhosted-backend/media/models/controller';

export class BackupHandler extends Handler {
    private baseUri = '/api/v4/backup';
    private latches: {
        [id: string]: boolean;
    } = {};
    private unsubs: UnsubscribeFns = [];

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('backup', async (data) => {
                if (data.type === 'update') {
                    if (this.sdk.store.backup.findById(data.backupId)) {
                        await this.getById(data.backupId, true);
                    }
                } else {
                    this.sdk.store.backup.remove(data.backupId);
                }
            }),
        );
    }

    clear() {
        callAndClearUnsubscribeFns(this.unsubs);
        this.latches = {};
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

    async restore(data: {
        file: File;
        onUploadProgress?: (event: AxiosProgressEvent) => void;
    }) {
        const uploadToken = await this.sdk.send<MediaRequestUploadTokenResult>({
            url: `${this.baseUri}/request/restore-upload-token`,
        });
        const fd = new FormData();
        fd.append('file', data.file, data.file.name);
        const query = [`token=${uploadToken.token}`];
        await this.sdk.send<ControllerItemResponse<Media>>({
            url: `${this.baseUri}/restore?${query.join('&')}`,
            method: 'POST',
            data: fd,
            onUploadProgress: data.onUploadProgress,
        });
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
