import * as path from 'path';
import { copyFile } from 'fs/promises';
import type { FS, Module } from '@becomes/purple-cheetah/types';
import { BCMSMedia, BCMSMediaAggregate, BCMSMediaType } from '../types';
import { Logger, useFS } from '@becomes/purple-cheetah';
import { BCMSRepo } from '@backend/repo';
import { BCMSFfmpeg } from '@backend/util';

let fs: FS;

export const BCMSMimeTypes: {
  css: string[];
  js: string[];
} = {
  css: ['application/x-pointplus', 'text/css'],
  js: [
    'application/x-javascript',
    'application/javascript',
    'application/ecmascript',
    'text/javascript',
    'text/ecmascript',
  ],
};

export class BCMSMediaService {
  static async aggregateFromParent({
    parent,
    basePath,
  }: {
    parent: BCMSMedia;
    basePath?: string;
  }): Promise<BCMSMediaAggregate> {
    if (!basePath) {
      basePath = await BCMSMediaService.getPath(parent);
    }
    const parentAggregate: BCMSMediaAggregate = {
      _id: typeof parent._id === 'string' ? parent._id : parent._id,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      isInRoot: parent.isInRoot,
      mimetype: parent.mimetype,
      name: parent.name,
      path: basePath || '',
      size: parent.size,
      state: false,
      type: parent.type,
      userId: parent.userId,
    };

    if (parent.hasChildren) {
      const childMedia = await BCMSRepo.media.methods.findAllByParentId(
        parent._id,
      );
      parentAggregate.children = [];
      for (let i = 0; i < childMedia.length; i++) {
        const child = childMedia[i];
        if (child.hasChildren) {
          parentAggregate.children.push(
            await BCMSMediaService.aggregateFromParent({
              parent: child,
              basePath: `${basePath}/${child.name}`,
            }),
          );
        } else {
          parentAggregate.children.push({
            _id: child._id,
            createdAt: child.createdAt,
            updatedAt: child.updatedAt,
            isInRoot: child.isInRoot,
            mimetype: child.mimetype,
            name: child.name,
            path: `${basePath}/${child.name}`,
            size: child.size,
            state: false,
            type: child.type,
            userId: child.userId,
          });
        }
      }
    }

    return parentAggregate;
  }

  static async aggregateFromRoot(): Promise<BCMSMediaAggregate[]> {
    const aggregated: BCMSMediaAggregate[] = [];
    const rootMedia = await BCMSRepo.media.methods.findAllByIsInRoot(true);
    for (let i = 0; i < rootMedia.length; i++) {
      aggregated.push(
        await BCMSMediaService.aggregateFromParent({ parent: rootMedia[i] }),
      );
    }
    return aggregated;
  }

  static async getChildren(parent: BCMSMedia): Promise<BCMSMedia[]> {
    const children = await BCMSRepo.media.methods.findAllByParentId(parent._id);
    const childrenOfChildren: BCMSMedia[] = [];
    for (const i in children) {
      const child = children[i];
      if (child.type === BCMSMediaType.DIR) {
        (await BCMSMediaService.getChildren(child)).forEach((e) => {
          childrenOfChildren.push(e);
        });
      }
    }
    return [...children, ...childrenOfChildren];
  }

  static mimetypeToMediaType(mimetype: string): BCMSMediaType {
    switch (mimetype) {
      case 'image/gif': {
        return BCMSMediaType.GIF;
      }
      case 'application/pdf': {
        return BCMSMediaType.PDF;
      }
      case 'text/html': {
        return BCMSMediaType.HTML;
      }
      case 'text/x-java-source': {
        return BCMSMediaType.JAVA;
      }
    }
    if (BCMSMimeTypes.js.includes(mimetype)) {
      return BCMSMediaType.JS;
    }
    if (BCMSMimeTypes.css.includes(mimetype)) {
      return BCMSMediaType.CSS;
    }
    switch (mimetype.split('/')[0]) {
      case 'image': {
        return BCMSMediaType.IMG;
      }
      case 'video': {
        return BCMSMediaType.VID;
      }
      case 'text': {
        return BCMSMediaType.TXT;
      }
      default: {
        return BCMSMediaType.OTH;
      }
    }
  }

  static async getPath(media: BCMSMedia): Promise<string> {
    if (media.type !== BCMSMediaType.DIR && media.isInRoot && !media.parentId) {
      return `/${media.name}`;
    } else {
      const parent = await BCMSRepo.media.findById(media.parentId);
      if (!parent) {
        return `/${media.name}`;
      }
      return `${await BCMSMediaService.getPath(parent)}/${media.name}`;
    }
  }

  static getNameAndExt(fullName: string): { name: string; ext: string } {
    const nameParts = fullName.split('.');
    return {
      name:
        nameParts.length > 1
          ? nameParts.slice(0, nameParts.length - 1).join('.')
          : nameParts[0],
      ext: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  }

  static storage = {
    async getPath({
      media,
      size,
      thumbnail,
    }: {
      media: BCMSMedia;
      size?: 'small';
      thumbnail?: boolean;
    }): Promise<string> {
      if (media.type === BCMSMediaType.DIR) {
        return path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        );
      }
      if (size === 'small' && media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        if (
          nameParts.ext === 'jpg' ||
          nameParts.ext === 'jpeg' ||
          nameParts.ext === 'png'
        ) {
          if (size === 'small') {
            const mediaPathParts = (
              await BCMSMediaService.getPath(media)
            ).split('/');
            const location = path.join(
              process.cwd(),
              'uploads',
              mediaPathParts.slice(0, mediaPathParts.length - 1).join('/'),
              `300-${media.name}`,
            );
            if (await fs.exist(location, true)) {
              return location;
            }
          }
        }
      } else if (
        thumbnail &&
        (media.type === BCMSMediaType.VID || media.type === BCMSMediaType.GIF)
      ) {
        const pathParts = path
          .join(process.cwd(), 'uploads', await BCMSMediaService.getPath(media))
          .split('/');
        const dirPath = pathParts.slice(0, pathParts.length - 1).join('/');
        const nameParts = media.name.split('.');
        const name =
          'thumbnail-' +
          nameParts.slice(0, nameParts.length - 1).join('.') +
          '.png';
        return `${dirPath}/${name}`;
      }
      return path.join(
        process.cwd(),
        'uploads',
        await BCMSMediaService.getPath(media),
      );
    },

    async exist(media: BCMSMedia): Promise<boolean> {
      return await fs.exist(
        path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        ),
        media.type !== BCMSMediaType.DIR,
      );
    },

    async get({
      media,
      size,
    }: {
      media: BCMSMedia;
      size?: 'small';
    }): Promise<Buffer> {
      if (size && media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        if (
          nameParts.ext === 'jpg' ||
          nameParts.ext === 'jpeg' ||
          nameParts.ext === 'png'
        ) {
          if (size === 'small') {
            const mediaPath = await BCMSMediaService.getPath(media);
            const location = path.join(
              process.cwd(),
              'uploads',
              mediaPath
                .split('/')
                .slice(0, mediaPath.length - 1)
                .join('/'),
              `300-${media.name}`,
            );
            if (await fs.exist(location, true)) {
              return await fs.read(location);
            }
          }
        }
      }
      return await fs.read(
        path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        ),
      );
    },

    async mkdir(media: BCMSMedia): Promise<void> {
      if (media.type === BCMSMediaType.DIR) {
        const mediaPath = await BCMSMediaService.getPath(media);
        await fs.save(
          path.join(process.cwd(), 'uploads', mediaPath, 'tmp.txt'),
          '',
        );
        await fs.deleteFile(
          path.join(process.cwd(), 'uploads', mediaPath, 'tmp.txt'),
        );
      }
    },

    async save(
      media: BCMSMedia,
      binary: Buffer,
      logger?: Logger,
    ): Promise<void> {
      const pathToMedia = await BCMSMediaService.getPath(media);
      await fs.save(path.join(process.cwd(), 'uploads', pathToMedia), binary);
      if (media.type === BCMSMediaType.IMG) {
        const nameParts = {
          name: media.name.split('.')[0],
          ext: media.name.split('.')[1].toLowerCase(),
        };
        if (
          nameParts.ext === 'jpg' ||
          nameParts.ext === 'jpeg' ||
          nameParts.ext === 'png'
        ) {
          await BCMSFfmpeg.createImageThumbnail({ media });
        }
      } else if (media.type === BCMSMediaType.VID) {
        try {
          await BCMSFfmpeg.createVideoThumbnail({ media });
        } catch (error) {
          if (logger) {
            logger.error('save', error);
          } else {
            // eslint-disable-next-line no-console
            console.error('save', error);
          }
        }
      } else if (media.type === BCMSMediaType.GIF) {
        try {
          await BCMSFfmpeg.createGifThumbnail({ media });
        } catch (error) {
          if (logger) {
            logger.error('save', error);
          } else {
            // eslint-disable-next-line no-console
            console.error('save', error);
          }
        }
      }
    },

    async rename(oldMedia: BCMSMedia, newMedia: BCMSMedia): Promise<void> {
      if (oldMedia.name !== newMedia.name) {
        const pathToOldMedia = await BCMSMediaService.getPath(oldMedia);
        const pathToNewMedia = await BCMSMediaService.getPath(newMedia);
        await fs.move(
          path.join(process.cwd(), 'uploads', pathToOldMedia),
          path.join(process.cwd(), 'uploads', pathToNewMedia),
        );
        const pathParts = pathToNewMedia.split('/');
        const basePath = pathParts.slice(0, pathParts.length - 1).join('/');
        if (newMedia.type === BCMSMediaType.IMG) {
          await fs.move(
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `300-${oldMedia.name}`,
            ),
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `300-${newMedia.name}`,
            ),
          );
        } else if (
          newMedia.type === BCMSMediaType.VID ||
          newMedia.type === BCMSMediaType.GIF
        ) {
          const oldNameParts = oldMedia.name.split('.');
          const oldName =
            oldNameParts.slice(0, oldNameParts.length - 1).join('.') + '.png';
          const newNameParts = newMedia.name.split('.');
          const newName =
            newNameParts.slice(0, newNameParts.length - 1).join('.') + '.png';
          await fs.move(
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `thumbnail-${oldName}`,
            ),
            path.join(
              process.cwd(),
              'uploads',
              basePath,
              `thumbnail-${newName}`,
            ),
          );
        }
      }
    },

    async removeFile(media: BCMSMedia): Promise<void> {
      const mediaPath = await BCMSMediaService.getPath(media);
      const pathParts = mediaPath.split('/');
      await fs.deleteFile(path.join(process.cwd(), 'uploads', mediaPath));
      const nameInfo = BCMSMediaService.getNameAndExt(media.name);
      if (media.type === BCMSMediaType.IMG) {
        if (
          nameInfo.ext === 'jpg' ||
          nameInfo.ext === 'jpeg' ||
          nameInfo.ext === 'png'
        ) {
          await fs.deleteFile(
            path.join(
              process.cwd(),
              'uploads',
              ...pathParts.slice(0, pathParts.length - 1),
              `300-${media.name}`,
            ),
          );
        }
      } else if (
        media.type === BCMSMediaType.VID ||
        media.type === BCMSMediaType.GIF
      ) {
        const dirPath =
          process.cwd() +
          '/uploads' +
          pathParts.slice(0, pathParts.length - 1).join('/');
        const nameParts = media.name.split('.');
        const name =
          nameParts.slice(0, nameParts.length - 1).join('.') + '.png';
        await fs.deleteFile(`${dirPath}/thumbnail-${name}`);
      }
      if (await fs.exist(path.join(process.cwd(), 'uploads', media._id))) {
        await fs.deleteDir(path.join(process.cwd(), 'uploads', media._id));
      }
    },

    async removeDir(media: BCMSMedia): Promise<void> {
      const childMedia = (await BCMSMediaService.getChildren(media)).filter(
        (e) => e.type !== BCMSMediaType.DIR,
      );
      for (let i = 0; i < childMedia.length; i++) {
        const child = childMedia[i];
        if (await fs.exist(path.join(process.cwd(), 'uploads', child._id))) {
          await fs.deleteDir(path.join(process.cwd(), 'uploads', child._id));
        }
      }
      await fs.deleteDir(
        path.join(
          process.cwd(),
          'uploads',
          await BCMSMediaService.getPath(media),
        ),
      );
    },

    async move(
      oldMedia: BCMSMedia,
      newMedia?: BCMSMedia | null,
    ): Promise<void> {
      const pathToOldMedia = await BCMSMediaService.getPath(oldMedia);
      const pathToOldMediaParts = pathToOldMedia.split('/');
      const fullNameMedia = pathToOldMediaParts
        .slice(pathToOldMediaParts.length - 1, pathToOldMediaParts.length)
        .join('');
      const namePartsMedia = await BCMSMediaService.getNameAndExt(
        fullNameMedia,
      );
      let pathToNewMedia: string;
      let mediaNameWithNewPath: string;
      let pathForThumbnailVideo: string;
      let pathForThumbnailImage: string;
      if (newMedia) {
        pathToNewMedia = await BCMSMediaService.getPath(newMedia);
        mediaNameWithNewPath = `${pathToNewMedia}/${oldMedia.name}`;
        pathForThumbnailVideo = `${pathToNewMedia}/thumbnail-${namePartsMedia.name}.png`;
        pathForThumbnailImage = `${pathToNewMedia}/300-${oldMedia.name}`;
      } else {
        mediaNameWithNewPath = `${oldMedia.name}`;
        mediaNameWithNewPath = `${oldMedia.name}`;
        pathForThumbnailVideo = `thumbnail-${namePartsMedia.name}.png`;
        pathForThumbnailImage = `300-${oldMedia.name}`;
      }
      await fs.move(
        path.join(process.cwd(), 'uploads', pathToOldMedia),
        path.join(process.cwd(), 'uploads', mediaNameWithNewPath),
      );
      if (oldMedia.type !== BCMSMediaType.DIR) {
        const basePathToOldMedia = pathToOldMediaParts
          .slice(0, pathToOldMediaParts.length - 1)
          .join('/');
        if (oldMedia.type === BCMSMediaType.IMG) {
          await fs.move(
            path.join(
              process.cwd(),
              'uploads',
              basePathToOldMedia,
              `300-${oldMedia.name}`,
            ),
            path.join(process.cwd(), 'uploads', pathForThumbnailImage),
          );
        } else if (
          oldMedia.type === BCMSMediaType.VID ||
          oldMedia.type === BCMSMediaType.GIF
        ) {
          const mediaInfo = BCMSMediaService.getNameAndExt(oldMedia.name);
          const name = mediaInfo.name + '.png';
          await fs.move(
            path.join(
              process.cwd(),
              'uploads',
              basePathToOldMedia,
              `thumbnail-${name}`,
            ),
            path.join(process.cwd(), 'uploads', pathForThumbnailVideo),
          );
        }
      }
    },

    async duplicate(oldMedia: BCMSMedia, newMedia: BCMSMedia): Promise<void> {
      const pathToOldMedia = await BCMSMediaService.getPath(oldMedia);
      const pathToNewMedia = await BCMSMediaService.getPath(newMedia);
      await copyFile(
        path.join(process.cwd(), 'uploads', pathToOldMedia),
        path.join(process.cwd(), 'uploads', pathToNewMedia),
      );
      if (oldMedia.type === BCMSMediaType.IMG) {
        const oldBaseParts = pathToOldMedia.split('/');
        const oldBasePath = oldBaseParts
          .slice(0, oldBaseParts.length - 1)
          .join('/');
        const newBaseParts = pathToNewMedia.split('/');
        const newBasePath = newBaseParts
          .slice(0, newBaseParts.length - 1)
          .join('/');
        await copyFile(
          path.join(
            process.cwd(),
            'uploads',
            oldBasePath,
            `300-${oldMedia.name}`,
          ),
          path.join(
            process.cwd(),
            'uploads',
            newBasePath,
            `300-${newMedia.name}`,
          ),
        );
      } else if (
        oldMedia.type === BCMSMediaType.VID ||
        oldMedia.type === BCMSMediaType.GIF
      ) {
        const oldBaseParts = pathToOldMedia.split('/');
        const oldBasePath = oldBaseParts
          .slice(0, oldBaseParts.length - 1)
          .join('/');
        const newBaseParts = pathToNewMedia.split('/');
        const newBasePath = newBaseParts
          .slice(0, newBaseParts.length - 1)
          .join('/');
        const oldMediaInfo = BCMSMediaService.getNameAndExt(oldMedia.name);
        const newMediaInfo = BCMSMediaService.getNameAndExt(newMedia.name);
        await copyFile(
          path.join(
            process.cwd(),
            'uploads',
            oldBasePath,
            `thumbnail-${oldMediaInfo.name}.png`,
          ),
          path.join(
            process.cwd(),
            'uploads',
            newBasePath,
            `thumbnail-${newMediaInfo.name}.png`,
          ),
        );
      }
    },
  };
}

export function createBcmsMediaService(): Module {
  return {
    name: 'Media service',
    initialize(moduleConfig) {
      fs = useFS();
      moduleConfig.next();
    },
  };
}
