import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSPropHandler } from '@backend/prop';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSSocketEventType,
  BCMSTag,
  BCMSTagCreateData,
  BCMSTagUpdateData,
  BCMSUserCustomPool,
} from '@backend/types';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus, Logger } from '@becomes/purple-cheetah/types';

export class BCMSTagRequestHandler {
  static async getAll(): Promise<BCMSTag[]> {
    return await BCMSRepo.tag.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSTag[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.tag.findAllById(ids);
    } else {
      return await BCMSRepo.tag.methods.findAllByCid(ids);
    }
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTag> {
    const tag =
      id.length === 24
        ? await BCMSRepo.tag.findById(id)
        : await BCMSRepo.tag.methods.findByCid(id);
    if (!tag) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tag001', { id }),
      );
    }
    return tag;
  }
  static async getByValue({
    value,
    errorHandler,
  }: {
    value: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTag> {
    const tag = await BCMSRepo.tag.methods.findByValue(value);
    if (!tag) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tag010', { value }),
      );
    }
    return tag;
  }
  static async create({
    sid,
    accessToken,
    errorHandler,
    body,
  }: {
    sid?: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSTagCreateData;
  }): Promise<BCMSTag> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('tags');
    if (!idc) {
      const tagIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'tags',
        name: 'Tags',
      });
      const addIdcResult = await BCMSRepo.idc.add(tagIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    if (body.value === '') {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('tag009'),
      );
    }
    const existTag = await BCMSRepo.tag.methods.findByValue(body.value);
    if (existTag) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('tag002', { value: body.value }),
      );
    }
    const tag = BCMSFactory.tag.create({
      cid: idc.toString(16),
      value: body.value,
    });
    const addedTag = await BCMSRepo.tag.add(tag);
    if (!addedTag) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tag003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TAG,
      BCMSEventConfigMethod.ADD,
      addedTag,
    );
    await BCMSSocketManager.emit.tag({
      tagId: addedTag._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('tag');
    return addedTag;
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
    body: BCMSTagUpdateData;
  }): Promise<BCMSTag> {
    if (body.value === '') {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('tag009'),
      );
    }
    const tag = await BCMSRepo.tag.findById(body._id);
    if (!tag) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tag001', { id: body._id }),
      );
    }
    const existTag = await BCMSRepo.tag.methods.findByValue(body.value);
    if (existTag) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('tag002', { value: body.value }),
      );
    }
    let changeDetected = false;
    if (typeof body.value === 'string' && body.value !== tag.value) {
      changeDetected = true;
      tag.value = body.value;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const updatedTag = await BCMSRepo.tag.update(tag);
    if (!updatedTag) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tag005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TAG,
      BCMSEventConfigMethod.UPDATE,
      updatedTag,
    );
    await BCMSSocketManager.emit.tag({
      tagId: updatedTag._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('tag');
    return updatedTag;
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
    const tag = await BCMSRepo.tag.findById(id);
    if (!tag) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tag001', { id }),
      );
    }
    const deleteTag = await BCMSRepo.tag.deleteById(id);
    if (!deleteTag) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tag006'),
      );
    }
    const errors = await BCMSPropHandler.removeTag({
      tagId: tag._id,
    });
    if (errors) {
      logger.error(name, errors);
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TAG,
      BCMSEventConfigMethod.DELETE,
      tag,
    );
    await BCMSSocketManager.emit.tag({
      tagId: tag._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('tag');
  }
}
