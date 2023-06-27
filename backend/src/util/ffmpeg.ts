import * as systemPath from 'path';
import type { FS, Logger, Module } from '@becomes/purple-cheetah/types';
import { BCMSMedia, BCMSMediaType } from '../types';
import { useFS, useLogger } from '@becomes/purple-cheetah';
import { BCMSMediaService } from '@backend/media';
import { ChildProcess } from '@banez/child_process';
import type { ChildProcessOnChunkHelperOutput } from '@banez/child_process/types';

let fs: FS;
let logger: Logger;

export class BCMSFfmpeg {
  static async createVideoThumbnail({
    media,
  }: {
    media: BCMSMedia;
  }): Promise<void> {
    if (media.type !== BCMSMediaType.VID) {
      return;
    }
    const nameParts = media.name.split('.');
    const name = nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
    const pathParts = (await BCMSMediaService.getPath(media)).split('/');
    const path =
      process.cwd() +
      '/uploads' +
      pathParts.slice(0, pathParts.length - 1).join('/');
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/${media.name}`,
      '-ss',
      '00:00:01.000',
      '-vframes',
      '1',
      `${path}/tmp-${name}`,
    ]);
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/tmp-${name}`,
      '-vf',
      'scale=300:-1',
      `${path}/thumbnail-${name}`,
    ]);
    await fs.deleteFile(`${path}/tmp-${name}`);
  }

  static async createGifThumbnail({
    media,
  }: {
    media: BCMSMedia;
  }): Promise<void> {
    if (media.type !== BCMSMediaType.GIF) {
      return;
    }
    const nameParts = media.name.split('.');
    const name = nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
    const pathParts = (await BCMSMediaService.getPath(media)).split('/');
    const path =
      process.cwd() +
      '/uploads' +
      pathParts.slice(0, pathParts.length - 1).join('/');
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/${media.name}`,
      '-ss',
      '00:00:01.000',
      '-vframes',
      '1',
      `${path}/tmp-${name}`,
    ]);
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      `${path}/tmp-${name}`,
      '-vf',
      'scale=300:-1',
      `${path}/thumbnail-${name}`,
    ]);
    await fs.deleteFile(`${path}/tmp-${name}`);
  }

  static async createImageThumbnail({
    media,
  }: {
    media: BCMSMedia;
  }): Promise<void> {
    const pathToMedia = await BCMSMediaService.getPath(media);
    const inputPath = systemPath.join(process.cwd(), 'uploads', pathToMedia);
    const mediaPathParts = pathToMedia.split('/');
    const pathOnly = mediaPathParts
      .slice(0, mediaPathParts.length - 1)
      .join('/');
    await ChildProcess.spawn('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-vf',
      'scale=300:-1',
      systemPath.join(process.cwd(), 'uploads', pathOnly, `300-${media.name}`),
    ]);
  }

  static async getVideoInfo({
    media,
  }: {
    media: BCMSMedia;
  }): Promise<{ width: number; height: number }> {
    const output: {
      width: number;
      height: number;
    } = {
      width: -1,
      height: -1,
    };
    const pathParts = (await BCMSMediaService.getPath(media)).split('/');
    const path =
      process.cwd() +
      '/uploads' +
      pathParts.slice(0, pathParts.length - 1).join('/');
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
        `${path}/${media.name}`,
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
      logger.warn('getVideoInfo', { exo, error });
    }
    return output;
  }
}

export function createBcmsFfmpeg(): Module {
  return {
    name: 'FFMPEG',
    initialize(moduleConfig) {
      fs = useFS();
      logger = useLogger({
        name: 'FFMPEG',
      });
      moduleConfig.next();
    },
  };
}
