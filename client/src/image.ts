import { Buffer } from 'buffer';
import type {
    Media,
    MediaType,
} from '@bcms/selfhosted-backend/media/models/main';
import type { Client } from '@bcms/selfhosted-client/main';
import type { MediaExtended } from '@bcms/selfhosted-client/handlers/media';
import type { PropMediaDataParsed } from '@bcms/selfhosted-backend/prop/models/media';

export interface ImageHandlerOptionSize {
    width: number;
    height?: number;
    quality?: number;
}

export interface ImageHandlerOptions {
    sizes: ImageHandlerOptionSize[];
}

export interface ImageHandlerPictureSrcSetResult {
    original: string;
    src1: string;
    src2: string;
    width: number;
    height: number;
}

const parsableMediaTypes: (keyof typeof MediaType)[] = ['IMG'];

export class ImageHandler {
    private options: ImageHandlerOptions;

    parsable: boolean;
    fileName: string;
    fileExtension: string;

    constructor(
        private client: Client,
        private media: MediaExtended | Media | PropMediaDataParsed,
        options?: ImageHandlerOptions,
    ) {
        this.parsable = parsableMediaTypes.includes(media.type);
        if (options) {
            this.options = options;
        } else {
            const defaultQuality = 75;
            this.options = {
                sizes: [
                    {
                        width: 350,
                        quality: defaultQuality,
                    },
                    {
                        width: 650,
                        quality: defaultQuality,
                    },
                    {
                        width: 900,
                        quality: defaultQuality,
                    },
                    {
                        width: 1200,
                        quality: defaultQuality,
                    },
                    {
                        width: 1600,
                        quality: defaultQuality,
                    },
                    {
                        width: 1920,
                        quality: defaultQuality,
                    },
                ],
            };
        }
        const nameParts = this.media.name.split('.');
        this.fileName = nameParts.slice(0, nameParts.length - 1).join('.');
        this.fileExtension = nameParts[nameParts.length - 1];
    }

    private closestSize(elementWidth: number): ImageHandlerOptionSize {
        const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
        const containerWidth = elementWidth * dpr;
        let delta = 1000000;
        let bestOptionIndex = 0;
        for (let i = 0; i < this.options.sizes.length; i++) {
            const size = this.options.sizes[i];
            let widthDelta = containerWidth - size.width;
            if (widthDelta < 0) {
                widthDelta = -widthDelta;
            }
            if (widthDelta < delta) {
                delta = widthDelta;
                bestOptionIndex = i;
            }
        }
        return this.options.sizes[bestOptionIndex];
    }

    async getSvgContent(): Promise<string> {
        if (this.media.type !== 'SVG') {
            throw Error(
                'Provided media is not of type SVG -> ' +
                    JSON.stringify(this.media, null, 2),
            );
        }
        const bin = await this.client.media.getMediaBin(
            this.media._id,
            this.media.name,
        );
        return Buffer.from(bin).toString();
    }

    getPictureSrcSet(elementWidth: number): ImageHandlerPictureSrcSetResult {
        const closestSize = this.closestSize(elementWidth);
        return {
            original: `${this.client.cmsOrigin}${this.client.media.toUri(this.media._id, this.media.name)}`,
            src1: `${this.client.cmsOrigin}${this.client.media.toUri(
                this.media._id,
                this.fileName + '.webp',
                {
                    image: {
                        quality: closestSize.quality,
                        width: closestSize.width,
                        height: closestSize.height,
                        webp: true,
                    },
                },
            )}`,
            src2: `${this.client.cmsOrigin}${this.client.media.toUri(
                this.media._id,
                this.media.name,
                {
                    image: {
                        quality: closestSize.quality,
                        width: closestSize.width,
                        height: closestSize.height,
                    },
                },
            )}`,
            width: closestSize.width,
            height:
                closestSize.height ||
                closestSize.width / (this.media.width / this.media.height),
        };
    }
}
