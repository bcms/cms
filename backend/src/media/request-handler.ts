import * as crypto from 'crypto';
import imageSize from 'image-size';
import * as util from 'util';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAggregate,
  BCMSMediaDuplicateData,
  BCMSMediaMoveData,
  BCMSMediaType,
  BCMSMediaUpdateData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus, Logger } from '@becomes/purple-cheetah/types';
import { BCMSMediaService } from './service';
import { BCMSSocketManager } from '@backend/socket';
import { BCMSPropHandler } from '@backend/prop';
import { BCMSEventManager } from '@backend/event';
import { BCMSFfmpeg } from '@backend/util';
export class BCMSMediaRequestHandler {
  private static uploadTokens: {
    [token: string]: JWT<BCMSUserCustomPool>;
  } = {};
  static async getAll(): Promise<BCMSMedia[]> {
    return await BCMSRepo.media.findAll();
  }
  static async getAllAggregated(): Promise<BCMSMediaAggregate[]> {
    return await BCMSMediaService.aggregateFromRoot();
  }
  static async getAllByParentId({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSMedia[]> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }
    return await BCMSMediaService.getChildren(media);
  }
  static async getMany(ids: string[]): Promise<BCMSMedia[]> {
    return await BCMSRepo.media.findAllById(ids);
  }
  static async count(): Promise<number> {
    return await BCMSRepo.media.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSMedia> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }
    return media;
  }

  static async getByIdAggregated({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSMediaAggregate> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }

    if (media.type !== BCMSMediaType.DIR) {
      return {
        _id: media._id,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
        isInRoot: media.isInRoot,
        mimetype: media.mimetype,
        name: media.name,
        size: media.size,
        state: false,
        type: media.type,
        userId: media.userId,
        path: await BCMSMediaService.getPath(media),
      };
    }
    return await BCMSMediaService.aggregateFromParent({
      parent: media,
    });
  }
  static validateUploadToken(
    uploadToke: string,
  ): JWT<BCMSUserCustomPool> | null {
    if (this.uploadTokens[uploadToke]) {
      const jwt = JSON.parse(JSON.stringify(this.uploadTokens[uploadToke]));
      delete this.uploadTokens[uploadToke];
      return jwt;
    }
    return null;
  }
  static requestUploadToken({
    accessToken,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
  }): { token: string } {
    const token = crypto
      .createHash('sha256')
      .update(Date.now() + crypto.randomBytes(16).toString('hex'))
      .digest('hex');
    this.uploadTokens[token] = accessToken;
    return { token };
  }
  static async createFile({
    sid,
    errorHandler,
    parentId,
    file,
    logger,
    name,
    uploadToken,
  }: {
    sid?: string;
    errorHandler: HTTPError;
    name: string;
    logger: Logger;
    parentId: string;
    uploadToken: string;
    file: Express.Multer.File | undefined;
  }): Promise<BCMSMedia> {
    const accessToken = this.uploadTokens[uploadToken];
    if (!accessToken) {
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Missing or invalid token.',
      );
    }
    if (!file) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('mda009'),
      );
    }
    let parent: BCMSMedia | null = null;
    if (parentId) {
      parent = await BCMSRepo.media.findById(parentId);
      if (!parent) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: parentId }),
        );
      }
    }
    const fileInfo = BCMSMediaService.getNameAndExt(file.originalname);
    const media = BCMSFactory.media.create({
      userId: accessToken.payload.userId,
      type: BCMSMediaService.mimetypeToMediaType(file.mimetype),
      mimetype: file.mimetype,
      size: file.size,
      name: `${StringUtility.toSlug(fileInfo.name)}${
        fileInfo.ext ? '.' + fileInfo.ext : ''
      }`,
      isInRoot: !parent,
      hasChildren: false,
      parentId: parentId ? parentId : '',
      altText: '',
      caption: '',
      height: -1,
      width: -1,
    });
    if (
      await BCMSRepo.media.methods.findByNameAndParentId(
        media.name,
        parent ? parent._id : undefined,
      )
    ) {
      media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
    }
    await BCMSMediaService.storage.save(media, file.buffer);
    if (media.type === BCMSMediaType.IMG) {
      try {
        const dimensions = await util.promisify(imageSize)(
          await BCMSMediaService.storage.getPath({ media }),
        );
        if (!dimensions) {
          throw errorHandler.occurred(
            HTTPStatus.NOT_FOUNT,
            bcmsResCode('mda013'),
          );
        }
        media.width = dimensions.width as number;
        media.height = dimensions.height as number;
      } catch (error) {
        logger.error(name, error);
      }
    } else if (
      media.type === BCMSMediaType.VID ||
      media.type === BCMSMediaType.GIF
    ) {
      const data = await BCMSFfmpeg.getVideoInfo({ media });
      media.width = data.width;
      media.height = data.height;
    }
    const addedMedia = await BCMSRepo.media.add(media);
    if (!addedMedia) {
      await BCMSMediaService.storage.removeFile(media);
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.ADD,
      addedMedia,
    );

    await BCMSSocketManager.emit.media({
      mediaId: addedMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    delete this.uploadTokens[uploadToken];
    return addedMedia;
  }
  static async createDir({
    sid,
    accessToken,
    errorHandler,
    body,
  }: {
    sid?: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSMediaAddDirData;
  }): Promise<BCMSMedia> {
    let parent: BCMSMedia | null = null;
    if (body.parentId) {
      parent = await BCMSRepo.media.findById(body.parentId);
      if (!parent) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: body.parentId }),
        );
      }
    }
    body.name = StringUtility.toSlug(body.name);
    const media = BCMSFactory.media.create({
      userId: accessToken.payload.userId,
      type: BCMSMediaType.DIR,
      mimetype: 'dir',
      name: body.name,
      isInRoot: !parent,
      parentId: parent ? parent._id : '',
      hasChildren: true,
      altText: '',
      caption: '',
      height: -1,
      width: -1,
    });
    if (
      await BCMSRepo.media.methods.findByNameAndParentId(
        media.name,
        parent ? parent._id : undefined,
      )
    ) {
      media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
    }
    const addedMedia = await BCMSRepo.media.add(media);
    if (!addedMedia) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda003'),
      );
    }
    await BCMSMediaService.storage.mkdir(addedMedia);
    BCMSEventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.ADD,
      addedMedia,
    );
    await BCMSSocketManager.emit.media({
      mediaId: addedMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return addedMedia;
  }
  static async update({
    sid,
    accessToken,
    errorHandler,
    body,
  }: {
    sid?: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSMediaUpdateData;
  }): Promise<BCMSMedia> {
    const media = await BCMSRepo.media.findById(body._id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id: body._id }),
      );
    }
    const oldMedia = JSON.parse(JSON.stringify(media));
    if (media.type === BCMSMediaType.DIR) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda005'),
      );
    }
    let changeDetected = false;
    const mediaNameInfo = BCMSMediaService.getNameAndExt(media.name);

    if (typeof body.name === 'string' && body.name !== mediaNameInfo.name) {
      const name = `${StringUtility.toSlug(body.name)}${
        mediaNameInfo.ext ? '.' + mediaNameInfo.ext : ''
      }`;

      if (
        await BCMSRepo.media.methods.findByNameAndParentId(name, media.parentId)
      ) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          bcmsResCode('mda002', { name }),
        );
      }

      changeDetected = true;
      media.name = name;
    }
    if (typeof body.altText === 'string' && body.altText !== media.altText) {
      changeDetected = true;
      media.altText = body.altText;
    }
    if (typeof body.caption === 'string' && body.caption !== media.caption) {
      changeDetected = true;
      media.caption = body.caption;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    await BCMSMediaService.storage.rename(oldMedia, media);
    const updateMedia = await BCMSRepo.media.update(media);
    if (!updateMedia) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.UPDATE,
      updateMedia,
    );
    await BCMSSocketManager.emit.media({
      mediaId: updateMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return updateMedia;
  }
  static async duplicateFile({
    sid,
    accessToken,
    errorHandler,
    body,
  }: {
    sid?: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSMediaDuplicateData;
  }): Promise<BCMSMedia> {
    const oldMedia = await BCMSRepo.media.findById(body._id);
    if (!oldMedia) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id: body._id }),
      );
    }
    if (oldMedia.type === BCMSMediaType.DIR) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda005'),
      );
    }
    const duplicateToMedia = await BCMSRepo.media.findById(body.duplicateTo);
    let isInRootMedia: boolean;
    let parentIdMedia: string;
    if (duplicateToMedia) {
      if (duplicateToMedia.type !== BCMSMediaType.DIR) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          bcmsResCode('mda005'),
        );
      }
      isInRootMedia = false;
      parentIdMedia = duplicateToMedia._id;
    } else {
      isInRootMedia = true;
      parentIdMedia = '';
    }
    const newMedia = BCMSFactory.media.create({
      userId: accessToken.payload.userId,
      type: oldMedia.type,
      mimetype: oldMedia.mimetype,
      size: oldMedia.size,
      name: oldMedia.name,
      isInRoot: isInRootMedia,
      hasChildren: false,
      parentId: parentIdMedia,
      altText: oldMedia.altText,
      caption: oldMedia.caption,
      height: oldMedia.height,
      width: oldMedia.width,
    });

    // Check if media with name exists, and if does,
    // prefix `copyof-{n}-{medianame}`
    {
      let loop = true;
      let depth = 0;
      let newName = newMedia.name;
      while (loop) {
        if (
          await BCMSRepo.media.methods.findByNameAndParentId(
            newName,
            body.duplicateTo,
          )
        ) {
          depth++;
        } else {
          loop = false;
        }
        newName = `copyof-${depth > 0 ? `${depth}-` : ''}${newMedia.name}`;
      }
      newMedia.name = newName;
    }

    await BCMSMediaService.storage.duplicate(oldMedia, newMedia);
    const duplicateMedia = await BCMSRepo.media.add(newMedia);
    if (!duplicateMedia) {
      await BCMSMediaService.storage.removeFile(newMedia);
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.ADD,
      duplicateMedia,
    );
    await BCMSSocketManager.emit.media({
      mediaId: duplicateMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return duplicateMedia;
  }
  static async moveFile({
    sid,
    accessToken,
    errorHandler,
    body,
  }: {
    sid?: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSMediaMoveData;
  }): Promise<BCMSMedia> {
    const media = await BCMSRepo.media.findById(body._id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id: body._id }),
      );
    }
    if (media.type === BCMSMediaType.DIR) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda005'),
      );
    }
    const moveToMedia = await BCMSRepo.media.findById(body.moveTo);

    await BCMSMediaService.storage.move(media, moveToMedia);
    if (moveToMedia) {
      media.isInRoot = false;
      media.parentId = body.moveTo;
    } else {
      media.isInRoot = true;
      media.parentId = '';
    }
    const moveMedia = await BCMSRepo.media.update(media);

    BCMSEventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.UPDATE,
      moveMedia,
    );
    await BCMSSocketManager.emit.media({
      mediaId: media._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return moveMedia;
  }
  static async delete({
    sid,
    errorHandler,
    id,
    logger,
    name,
    accessToken,
  }: {
    sid?: string;
    id: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    logger: Logger;
    name: string;
  }): Promise<void> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }
    let deletedChildrenIds: string[] = [];
    if (media.type === BCMSMediaType.DIR) {
      deletedChildrenIds = (await BCMSMediaService.getChildren(media)).map(
        (e) => e._id,
      );
      await BCMSMediaService.storage.removeDir(media);
      await BCMSRepo.media.deleteAllById(deletedChildrenIds);
      await BCMSRepo.media.deleteById(media._id);
    } else {
      const deleteResult = await BCMSRepo.media.deleteById(media._id);
      if (!deleteResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          bcmsResCode('mda006'),
        );
      }
      await BCMSMediaService.storage.removeFile(media);
    }
    const errors = await BCMSPropHandler.removeMedia({
      mediaId: media._id,
    });
    if (errors) {
      logger.error(name, errors);
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.MEDIA,
      BCMSEventConfigMethod.DELETE,
      media,
    );
    await BCMSSocketManager.emit.media({
      mediaId: media._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
  }
}
