import * as systemPath from 'path';
import { FS } from '@bcms/selfhosted-backend/_utils/fs';
import {
    type Media,
    MediaType,
} from '@bcms/selfhosted-backend/media/models/main';
import {
    ChildProcess,
    type ChildProcessOnChunkHelperOutput,
} from '@bcms/selfhosted-backend/_utils/child-process';

export class FFmpeg {
    private static tempFs = new FS(systemPath.join(process.cwd(), 'media-tmp'));

    static async createVideoThumbnail(
        media: Media,
        buffer: Buffer,
    ): Promise<Buffer | null> {
        if (media.type !== MediaType.VID) {
            return null;
        }
        const fileExt = media.mimetype.split('/')[1];
        await this.tempFs.save(media._id + `.${fileExt}`, buffer);
        const path = systemPath.join(process.cwd(), 'media-tmp');
        try {
            await ChildProcess.spawn('ffmpeg', [
                '-y',
                '-i',
                `${path}/${media._id}.${fileExt}`,
                '-ss',
                '00:00:01.000',
                '-vframes',
                '1',
                `${path}/${media._id}_tmp.png`,
            ]);
            await ChildProcess.spawn('ffmpeg', [
                '-y',
                '-i',
                `${path}/${media._id}_tmp.png`,
                '-vf',
                'scale=300:-1',
                `${path}/${media._id}_vid_thumbnail.png`,
            ]);
            const outputBuffer = await this.tempFs.read(
                `${media._id}_vid_thumbnail.png`,
            );
            await this.tempFs.deleteFile(`${media._id}_vid_thumbnail.png`);
            await this.tempFs.deleteFile(`${media._id}_tmp.png`);
            await this.tempFs.deleteFile(media._id + `.${fileExt}`);
            return outputBuffer;
        } catch (error) {
            console.error('Failed to create video thumbnail.', error);
            await this.tempFs.deleteFile(`${media._id}_vid_thumbnail.png`);
            await this.tempFs.deleteFile(`${media._id}_tmp.png`);
            await this.tempFs.deleteFile(media._id + `.${fileExt}`);
            return null;
        }
    }

    static async createImageThumbnail(
        media: Media,
        buffer: Buffer,
    ): Promise<Buffer | null> {
        if (media.type !== MediaType.IMG) {
            return null;
        }
        const fileExt = media.mimetype.split('/')[1];
        await this.tempFs.save(media._id + `.${fileExt}`, buffer);
        const path = systemPath.join(process.cwd(), 'media-tmp');
        try {
            await ChildProcess.spawn('ffmpeg', [
                '-y',
                '-i',
                `${path}/${media._id}.${fileExt}`,
                '-vf',
                'scale=300:-1',
                `${path}/${media._id}_thumbnail.png`,
            ]);
            const outputBuffer = await this.tempFs.read(
                `${media._id}_thumbnail.png`,
            );
            await this.tempFs.deleteFile(media._id + `.${fileExt}`);
            await this.tempFs.deleteFile(`${media._id}_thumbnail.png`);
            return outputBuffer;
        } catch (error) {
            console.error('Failed to create video thumbnail.', error);
            await this.tempFs.deleteFile(media._id + `.${fileExt}`);
            await this.tempFs.deleteFile(`${media._id}_thumbnail.png`);
            return null;
        }
    }

    static async getVideoInfo(media: Media, buffer: Buffer) {
        const output: {
            width: number;
            height: number;
        } = {
            width: -1,
            height: -1,
        };
        await this.tempFs.save(media._id, buffer);
        const path = systemPath.join(process.cwd(), 'media-tmp');
        const exo: ChildProcessOnChunkHelperOutput = {
            err: '',
            out: '',
        };
        await ChildProcess.advancedExec(
            [
                'ffprobe',
                '-v',
                'error',
                '-select_streams',
                'v',
                '-show_entries',
                'stream=width,height',
                '-of',
                'json',
                `${path}/${media._id}`,
            ],
            {
                cwd: process.cwd(),
                doNotThrowError: true,
                onChunk: ChildProcess.onChunkHelper(exo),
            },
        ).awaiter;
        try {
            const info = JSON.parse(exo.out);
            output.width = info.streams[0].width;
            output.height = info.streams[0].height;
        } catch (error) {
            console.warn('Failed to get vide information', exo, error);
        }
        await this.tempFs.deleteFile(media._id);
        return output;
    }
}
