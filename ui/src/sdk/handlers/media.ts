import { Buffer } from 'buffer';
import type { AxiosProgressEvent } from 'axios';
import { Handler } from '@bcms/selfhosted-sdk/handlers/_handler';
import { createQueue, QueueError } from '@bcms/selfhosted-utils/queue';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import { Sdk } from '@bcms/selfhosted-sdk';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';
import type {
    MediaCreateDirBody,
    MediaDeleteBody,
    MediaGetBinBody,
    MediaRequestUploadTokenResult,
    MediaUpdateBody,
} from '@bcms/selfhosted-backend/media/models/controller';

export class MediaHandler extends Handler {
    private baseUri = '/api/v4/media';
    private unsubs: Array<() => void> = [];
    private latch: {
        [key: string]: boolean;
    } = {};
    private getAllQueue = createQueue<Media[]>();

    constructor(private sdk: Sdk) {
        super();
        this.unsubs.push(
            this.sdk.socket.register('media', async (data) => {
                if (data.type === 'update') {
                    await this.get({
                        mediaId: data.mediaId,
                        skipCache: true,
                    });
                } else {
                    if (data.mediaId === 'many') {
                        await this.getAll({
                            skipCache: true,
                        });
                    } else {
                        this.sdk.store.media.remove(data.mediaId);
                    }
                }
            }),
        );
    }

    resolvePath(media: Media, allMedia: Media[]): string {
        if (media.parentId) {
            const parent = allMedia.find((e) => e._id === media.parentId);
            if (parent) {
                return `${this.resolvePath(parent, allMedia)}/${media.name}`;
            }
        }
        return '/' + media.name;
    }

    resolveTree(media: Media, allMedia: Media[]): Media[] {
        if (media.parentId) {
            const parent = allMedia.find((e) => e._id === media.parentId);
            if (parent) {
                return [...this.resolveTree(parent, allMedia), media];
            }
        }
        return [media];
    }

    clear() {
        this.latch = {};
        this.sdk.store.group.remove(
            this.sdk.store.group.items().map((e) => e._id),
        );
        this.unsubs.forEach((e) => e());
        this.unsubs = [];
    }

    async getAll(data?: { skipCache?: boolean }) {
        const queue = await this.getAllQueue({
            name: 'getAll',
            handler: async () => {
                if (!data?.skipCache && this.latch.all) {
                    return this.sdk.store.media.items();
                }
                const result = await this.sdk.send<
                    ControllerItemsResponse<Media>
                >({
                    url: `${this.baseUri}/all`,
                });
                this.sdk.store.media.remove(
                    this.sdk.store.media.items().map((e) => e._id),
                );
                this.sdk.store.media.set(result.items);
                this.latch.all = true;
                return result.items;
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
        return queue.data;
    }

    async get(data: { mediaId: string; skipCache?: boolean }) {
        if (!data.skipCache) {
            const cacheHit = this.sdk.store.media.findById(data.mediaId);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const result = await this.sdk.send<ControllerItemResponse<Media>>({
            url: `${this.baseUri}/${data.mediaId}`,
        });
        this.sdk.store.media.set(result.item);
        return result.item;
    }

    async bin(data: { media: Media; data: MediaGetBinBody }) {
        return await this.sdk.send<Buffer>({
            url: `${this.baseUri}/${data.media._id}/bin/${data.media.name}${
                data.data
                    ? `?data=${Buffer.from(JSON.stringify(data.data)).toString(
                          'hex',
                      )}`
                    : ''
            }`,
            method: 'GET',
            responseType: 'arraybuffer',
        });
    }

    toUri(data: {
        media: Media;
        orgId?: string;
        instanceId?: string;
        data?: MediaGetBinBody;
    }) {
        return `${this.baseUri}/${data.media._id}/bin/${data.media.name}${
            data.data
                ? `?data=${Buffer.from(JSON.stringify(data.data)).toString(
                      'hex',
                  )}`
                : ''
        }`;
    }

    async requestUploadToken() {
        const result = await this.sdk.send<MediaRequestUploadTokenResult>({
            url: `${this.baseUri}/request/upload-token`,
        });
        return result.token;
    }

    async createDir(data: MediaCreateDirBody) {
        const result = await this.sdk.send<ControllerItemResponse<Media>>({
            url: `${this.baseUri}/create/dir`,
            method: 'POST',
            data,
        });
        this.sdk.store.media.set(result.item);
        return result.item;
    }

    async createFile(data: {
        parentId?: string;
        uploadToken: string;
        file: File;
        name: string;
        onUploadProgress?: (event: AxiosProgressEvent) => void;
    }) {
        const fd = new FormData();
        fd.append('file', data.file, data.name);
        const query = [`token=${data.uploadToken}`];
        if (data.parentId) {
            query.push(`parentId=${data.parentId}`);
        }
        const result = await this.sdk.send<ControllerItemResponse<Media>>({
            url: `${this.baseUri}/create/file?${query.join('&')}`,
            method: 'POST',
            data: fd,
            onUploadProgress: data.onUploadProgress,
        });
        this.sdk.store.media.set(result.item);
        return result.item;
    }

    async update(data: MediaUpdateBody) {
        const result = await this.sdk.send<ControllerItemResponse<Media>>({
            url: `${this.baseUri}/update`,
            method: 'PUT',
            data,
        });
        this.sdk.store.media.set(result.item);
        return result.item;
    }

    async deleteById(data: MediaDeleteBody) {
        await this.sdk.send({
            url: `${this.baseUri}/delete`,
            method: 'DELETE',
            data,
        });
        this.sdk.store.media.remove(data.mediaIds);
    }
}
