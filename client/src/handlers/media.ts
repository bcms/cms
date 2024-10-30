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

/**
 * MediaExtended interface that extends the Media interface with additional properties and methods.
 */
export interface MediaExtended extends Media {
    /**
     * Optional string variable representing the SVG content.
     */
    svg?: string;

    /**
     * Retrieves a binary representation of media based on provided options.
     *
     * @param {MediaGetBinBodyImage} [options] - An optional configuration object to specify the details for media retrieval.
     * @return {Promise<Buffer>} A promise that resolves to a Buffer containing the binary data of the media.
     */
    bin(options?: MediaGetBinBodyImage): Promise<Buffer>;

    /**
     * Retrieves a thumbnail for a given media item.
     *
     * @return {Promise<Buffer>} A promise that resolves with the generated thumbnail as a Buffer.
     */
    thumbnail(): Promise<Buffer>;
}

/**
 * Handles media-related operations such as fetching media items, resolving media paths, and managing cache.
 */
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

    /**
     * Resolves the full path of a media item by traversing its parent hierarchy.
     *
     * @param {Media} media - The media item for which to resolve the path.
     * @param {Media[]} allMedia - An array of all media items, used to locate parent items.
     * @return {string} The resolved full path of the media item.
     */
    resolvePath(media: Media, allMedia: Media[]): string {
        if (media.parentId) {
            const parent = allMedia.find((e) => e._id === media.parentId);
            if (parent) {
                return `${this.resolvePath(parent, allMedia)}/${media.name}`;
            }
        }
        return '/' + media.name;
    }

    /**
     * Retrieves all media items, optionally bypassing the cache.
     *
     * @param {boolean} [skipCache] - If true, bypasses the in-memory cache and fetches fresh data.
     * @return {Promise<MediaExtended[]>} A promise that resolves to an array of extended media items.
     */
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

    /**
     * Retrieves a media item by its ID. Optionally skips the cache.
     *
     * @param {string} id - The unique identifier of the media item to retrieve.
     * @param {boolean} [skipCache] - Whether to bypass the cache and fetch directly from the source.
     * @return {Promise<MediaExtended>} A promise that resolves to the retrieved media item.
     */
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

    /**
     * Fetches a media file (binary) for specified media ID.
     *
     * @param {string} id - Identifier of the media.
     * @param {string} filename - Name of the file to fetch from the media bin.
     * @param {MediaGetBinBody} [data] - Optional additional parameters for the request.
     * @return {Promise<Buffer>} A promise that resolves to the binary data (Buffer) of the requested media file.
     */
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

    /**
     * Constructs a URI for accessing a media binary with optional data.
     *
     * @param {string} id - The identifier for the media resource.
     * @param {string} filename - The name of the file to be accessed.
     * @param {MediaGetBinBody} [data] - Optional data to be included in the query string.
     * @return {string} The constructed URI.
     */
    toUri(id: string, filename: string, data?: MediaGetBinBody): string {
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

    /**
     * Extends a Media object with additional functionality.
     *
     * @param {Media} media - The original Media object to extend.
     * @return {MediaExtended} An extended Media object with additional methods for bin and thumbnail retrieval.
     */
    private toMediaExtended(media: Media): MediaExtended {
        return {
            ...media,
            bin: async (options) => {
                return this.getMediaBin(media._id, media.name, {
                    thumbnail: false,
                    image: options,
                });
            },
            thumbnail: async () => {
                return this.getMediaBin(media._id, media.name, {
                    thumbnail: true,
                });
            },
        };
    }
}
