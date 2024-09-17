import { Buffer } from 'buffer';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type {
    MediaGetBinBody,
    MediaGetBinBodyImage,
} from '@bcms/selfhosted-backend/media/models/controller';
import { MemCache } from '@bcms/selfhosted-utils/mem-cache';
import type { Client } from '@bcms/selfhosted-client/main';
import type {
    ControllerItemResponse,
    ControllerItemsResponse,
} from '@bcms/selfhosted-backend/util/controller';

export interface MediaExtended extends Media {
    svg?: string;
    bin(options?: MediaGetBinBodyImage): Promise<Buffer>;
    thumbnail(options?: MediaGetBinBodyImage): Promise<Buffer>;
}

export class MediaHandler {
    private cache = new MemCache<MediaExtended>('_id');
    private latch: {
        [name: string]: boolean;
    } = {};

    baseUri = `/api/v4/media`;

    constructor(private client: Client) {
        if (this.client.enableSocket) {
            this.client.socket.register('media', async (data) => {
                if (data.type === 'update') {
                    const cacheHit = this.cache.findById(data.mediaId);
                    if (cacheHit) {
                        await this.getById(data.mediaId, true);
                    }
                } else {
                    this.cache.remove(data.mediaId);
                }
            });
        }
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

    async getAll(skipCache?: boolean): Promise<MediaExtended[]> {
        if (!skipCache && this.client.useMemCache && this.latch.all) {
            return this.cache.items;
        }
        const res = await this.client.send<ControllerItemsResponse<Media>>({
            url: `${this.baseUri}/all`,
        });
        const items: MediaExtended[] = [];
        for (let i = 0; i < res.items.length; i++) {
            const media = res.items[i];
            const item: MediaExtended = this.toMediaExtended(media);
            if (media.type === 'SVG' && this.client.injectSvg) {
                const svgBuffer = await this.getMediaBin(media._id, media.name);
                item.svg = Buffer.from(svgBuffer).toString();
            }
            items.push(item);
        }
        if (this.client.useMemCache) {
            this.cache.set(items);
            this.latch.all = true;
        }
        return items;
    }

    async getById(id: string, skipCache?: boolean): Promise<MediaExtended> {
        if (!skipCache && this.client.useMemCache) {
            const cacheHit = this.cache.findById(id);
            if (cacheHit) {
                return cacheHit;
            }
        }
        const res = await this.client.send<ControllerItemResponse<Media>>({
            url: `${this.baseUri}/${id}`,
        });
        const media = res.item;
        const item = this.toMediaExtended(media);
        if (media.type === 'SVG' && this.client.injectSvg) {
            const svgBuffer = await this.getMediaBin(media._id, media.name);
            item.svg = Buffer.from(svgBuffer).toString();
        }
        if (this.client.useMemCache) {
            this.cache.set(item);
        }
        return item;
    }

    async getMediaBin(
        id: string,
        filename: string,
        data?: MediaGetBinBody,
    ): Promise<Buffer> {
        return await this.client.send<Buffer>({
            url: `${this.baseUri}/${id}/bin/${filename}${data ? `?data=${Buffer.from(JSON.stringify(data)).toString('hex')}` : ''}`,
            method: 'get',
            responseType: 'arraybuffer',
        });
    }

    toUri(id: string, filename: string, data?: MediaGetBinBody) {
        const query: string[] = [];
        if (data) {
            query.push(
                `data=${Buffer.from(JSON.stringify(data)).toString('hex')}`,
            );
        }
        query.push(
            `apiKey=${this.client.apiKeyInfo.id}.${this.client.apiKeyInfo.secret}`,
        );
        let uri = this.baseUri;
        uri += `/${id}/bin/${filename}`;
        if (query.length > 0) {
            uri += '?' + query.join('&');
        }
        return uri;
    }

    private toMediaExtended(media: Media): MediaExtended {
        return {
            ...media,
            bin: async (options) => {
                return this.getMediaBin(media._id, media.name, {
                    thumbnail: false,
                    image: options,
                });
            },
            thumbnail: async (options) => {
                return this.getMediaBin(media._id, media.name, {
                    thumbnail: true,
                    image: options,
                });
            },
        };
    }
}
