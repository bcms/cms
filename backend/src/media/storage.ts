import crypto from 'crypto';
import fileSystem from 'fs';
import systemPath from 'path';
import { promisify } from 'util';
import process from 'process';
import type { ISizeCalculationResult } from 'image-size/dist/types/interface';
import imageSize from 'image-size';
import { Logger } from '@thebcms/selfhosted-backend/server';
import { FS } from '@thebcms/selfhosted-backend/_utils/fs';
import { FunctionBuilder } from '@thebcms/selfhosted-backend/util/function-builder';
import {
    type Media,
    MediaType,
} from '@thebcms/selfhosted-backend/media/models/main';
import { Storage } from '@thebcms/selfhosted-backend/storage/main';
import { Config } from '@thebcms/selfhosted-backend/config';
import { FFmpeg } from '@thebcms/selfhosted-backend/util/ffmpeg';
import type { MediaGetBinBodyImage } from '@thebcms/selfhosted-backend/media/models/controller';
import { ChildProcess } from '@thebcms/selfhosted-backend/_utils/child-process';

export interface MediaStorageOptions {
    thumbnail?: boolean;
}

export class MediaStorage {
    static logger = new Logger('Media Storage');
    private static type = 'media';
    private static tempFs = new FS(systemPath.join(process.cwd(), 'media-tmp'));
    private static jpgQualityFn = FunctionBuilder.linear2D([
        [0, 0],
        [100, 31],
    ]);

    static resolveCloudPath(media: Media, options?: MediaStorageOptions) {
        if (media.type === 'DIR') {
            return `/${media._id}`;
        }
        const originalFilename = `original.${
            media.mimetype
                .split('/')[1]
                .split('-')[0]
                .split('_')[0]
                .split('+')[0]
        }`;
        return `/${media._id}/${
            options
                ? options.thumbnail
                    ? 'thumbnail.png'
                    : originalFilename
                : originalFilename
        }`;
    }

    static resolveFilePath(media: Media, allMedia: Media[]): string {
        if (media.parentId) {
            const parent = allMedia.find((e) => e._id === media.parentId);
            if (parent) {
                return `${MediaStorage.resolveFilePath(parent, allMedia)}/${
                    media.name
                }`;
            }
        }
        return '/' + media.name;
    }

    static async read(media: Media, options?: MediaStorageOptions) {
        const path = this.resolveCloudPath(media, options);
        try {
            return await Storage.fs.read([
                Config.storageScope,
                this.type,
                ...path.split('/'),
            ]);
        } catch (err) {
            const error = err as Error;
            this.logger.warn('read', {
                msg: error.message,
                stack: error.stack,
            });
        }
        return null;
    }

    static async readStream(media: Media, options?: MediaStorageOptions) {
        const path = this.resolveCloudPath(media, options);
        try {
            return fileSystem.createReadStream(
                systemPath.join(
                    process.cwd(),
                    'uploads',
                    Config.storageScope,
                    this.type,
                    ...path.split('/'),
                ),
            );
        } catch (err) {
            const error = err as Error;
            this.logger.warn('read', {
                msg: error.message,
                stack: error.stack,
            });
        }
        return null;
    }

    static async removeMediaAndChildren(media: Media) {
        const path = `/${media._id}`;
        await Storage.fs.deleteDir([
            Config.storageScope,
            this.type,
            ...path.split('/'),
        ]);
    }

    static async remove(media: Media, options?: MediaStorageOptions) {
        const path = this.resolveCloudPath(media, options);
        try {
            await Storage.fs.deleteFile([
                Config.storageScope,
                this.type,
                ...path.split('/'),
            ]);
        } catch (error) {
            this.logger.warn('remove', error);
        }
    }

    static async removeMany(paths: string[]) {
        try {
            for (let i = 0; i < paths.length; i++) {
                await Storage.fs.deleteFile([
                    Config.storageScope,
                    this.type,
                    ...paths[i].split('/'),
                ]);
            }
        } catch (error) {
            this.logger.warn('remove', error);
        }
    }

    /**
     * Will mutate media object, save it, and create thumbnail if required
     */
    static async save(media: Media, buffer: Buffer) {
        const filePath = this.resolveCloudPath(media, {
            thumbnail: false,
        });
        const fileThumbnailPath = this.resolveCloudPath(media, {
            thumbnail: true,
        });
        let thumbnail: Buffer | null = null;
        if (media.type === 'IMG') {
            await MediaStorage.tempFs.save(media._id, buffer);
            let dimensions: ISizeCalculationResult | undefined;
            try {
                dimensions = await promisify(imageSize)(
                    systemPath.join(process.cwd(), 'media-tmp', media._id),
                );
            } catch (error) {
                console.warn(error);
                await MediaStorage.tempFs.deleteFile(media._id);
                throw Error(
                    'Image file that you' +
                        ' uploaded does not have dimensions. Please check if the' +
                        ' file is corrupted.',
                );
            }
            await MediaStorage.tempFs.deleteFile(media._id);
            if (!dimensions || !dimensions.width || !dimensions.height) {
                throw Error(
                    'Image file that you' +
                        ' uploaded does not have dimensions. Please check if the' +
                        ' file is corrupted.',
                );
            }
            media.width = dimensions.width;
            media.height = dimensions.height;
            thumbnail = await FFmpeg.createImageThumbnail(media, buffer);
            if (!thumbnail) {
                throw Error('Failed to create image thumbnail');
            }
        } else if (media.type === 'VID') {
            const dimensions = await FFmpeg.getVideoInfo(media, buffer);
            if (!dimensions) {
                throw Error(
                    'Video file that you' +
                        ' uploaded does not have dimensions. Please check if the' +
                        ' file is corrupted.',
                );
            }
            media.width = dimensions.width;
            media.height = dimensions.height;
            thumbnail = await FFmpeg.createVideoThumbnail(media, buffer);
            if (!thumbnail) {
                console.warn('Media', media);
                throw Error('Failed to create video thumbnail');
            }
        }
        try {
            await Storage.fs.save(
                [Config.storageScope, this.type, ...filePath.split('/')],
                buffer,
            );
            if (thumbnail) {
                await Storage.fs.save(
                    [
                        Config.storageScope,
                        this.type,
                        ...fileThumbnailPath.split('/'),
                    ],
                    thumbnail,
                );
            }
        } catch (error) {
            this.logger.warn('save', error);
        }
    }

    static async pathExists(path: string): Promise<boolean> {
        try {
            return await Storage.fs.exist(
                [Config.storageScope, this.type, ...path.split('/')],
                true,
            );
        } catch (error) {
            const err = error as any;
            if (err.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    static async imageProcessOrGet(
        media: Media,
        options: MediaGetBinBodyImage,
    ): Promise<{ buffer: Buffer; mimetype: string; filename: string }> {
        if (media.type !== MediaType.IMG) {
            throw Error('Media is not of type IMG');
        }
        const optionsString: string = [
            options.width ? options.width + '' : '',
            options.height ? options.height + '' : '',
            options.quality ? options.quality + '' : '',
            options.webp ? 't' : 'f',
        ].join('-');
        const mimetype = options.webp ? 'image/webp' : media.mimetype;
        const outputExt = mimetype.split('/')[1];
        const path = `/${media._id}/processed/${optionsString}.${outputExt}`;
        if (await this.pathExists(path)) {
            return {
                buffer: await Storage.fs.read([
                    Config.storageScope,
                    this.type,
                    ...path.split('/'),
                ]),
                mimetype,
                filename: `${media.name.split('.')[0]}.${
                    mimetype.split('/')[1]
                }`,
            };
        }
        const hash = crypto.randomBytes(16).toString('hex');
        const originalExt = media.mimetype.split('/')[1];
        const tempFileName = hash + `.${media.mimetype.split('/')[1]}`;
        const outputFileName =
            `output_` +
            hash +
            `.${options.webp ? 'webp' : media.mimetype.split('/')[1]}`;
        const original = await this.read(media);
        if (!original) {
            throw Error('Media binary data not found');
        }
        await this.tempFs.save(tempFileName, original);
        const resize: {
            width: number;
            height: number;
            crop?: [number, number];
            quality: number;
        } = {
            width: parseInt(media.width.toFixed(0)),
            height: parseInt(media.height.toFixed(0)),
            quality: 1,
        };
        if (options.width || options.height) {
            if (options.width && options.height) {
                const originalAspect = media.width / media.height;
                if (options.height > options.width) {
                    resize.height = options.height;
                    resize.width = parseInt(
                        (options.height * originalAspect).toFixed(0),
                    );
                } else {
                    resize.width = options.width;
                    resize.height = parseInt(
                        (options.width / originalAspect).toFixed(0),
                    );
                }
                resize.crop = [options.width, options.height];
                if (resize.crop[1] > resize.height) {
                    resize.height = resize.crop[1];
                    resize.width = parseInt(
                        (options.height * originalAspect).toFixed(0),
                    );
                }
            } else if (options.width && !options.height) {
                resize.width = options.width;
                resize.height = -1;
            } else if (!options.width && options.height) {
                resize.height = options.height;
                resize.width = -1;
            }
        }
        if (options.quality) {
            if (options.quality > 100) {
                options.quality = 100;
            } else if (options.quality < 0) {
                options.quality = 0;
            }
            if (originalExt === 'png') {
                resize.quality = parseInt(options.quality.toFixed(0));
            } else {
                resize.quality = parseInt(
                    this.jpgQualityFn(options.quality).toFixed(0),
                );
            }
        } else {
            if (originalExt === 'png') {
                resize.quality = 75;
            } else {
                resize.quality = parseInt(this.jpgQualityFn(75).toFixed(0));
            }
        }
        await ChildProcess.advancedExec(
            [
                'ffmpeg',
                '-y',
                '-i',
                this.tempFs.baseRoot + '/' + tempFileName,
                '-vf',
                `scale='${resize.width}:${resize.height}${
                    resize.crop
                        ? // ? `:force_original_aspect_ratio=decrease,crop=${resize.crop[0]}:${resize.crop[1]}`
                          `,crop=${resize.crop[0]}:${resize.crop[1]}`
                        : ''
                }'`,
                '-compression_level',
                '' + resize.quality,
                this.tempFs.baseRoot + '/' + outputFileName,
            ].join(' '),
            {
                onChunk(type, chunk) {
                    process[type].write(chunk);
                },
            },
        ).awaiter;
        const processBuffer = await this.tempFs.read(outputFileName);
        await this.tempFs.deleteFile(tempFileName);
        await this.tempFs.deleteFile(outputFileName);
        await Storage.fs.save(
            [Config.storageScope, this.type, ...path.split('/')],
            processBuffer,
        );
        return {
            buffer: processBuffer,
            mimetype,
            filename: `${media.name.split('.')[0]}.${mimetype.split('/')[1]}`,
        };
    }
}
