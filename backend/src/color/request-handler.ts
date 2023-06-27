import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorUpdateData,
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSColorService } from './service';

export class BCMSColorRequestHandler {
  static async getAll(): Promise<BCMSColor[]> {
    return await BCMSRepo.color.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSColor[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.color.findAllById(ids);
    } else {
      return await BCMSRepo.color.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.color.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSColor> {
    const color =
      id.length === 24
        ? await BCMSRepo.color.findById(id)
        : await BCMSRepo.color.methods.findByCid(id);
    if (!color) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('col001', { id }),
      );
    }
    return color;
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
    body: BCMSColorCreateData;
  }): Promise<BCMSColor> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('colors');
    if (!idc) {
      const colorIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'colors',
        name: 'Colors',
      });
      const addIdcResult = await BCMSRepo.idc.add(colorIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }

    if (!(BCMSColorService.check(body.value))) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('col010'),
      );
    }
    const color = BCMSFactory.color.create({
      cid: idc.toString(16),
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      value: body.value,
      userId: accessToken.payload.userId,
      global: body.global,
    });
    const addedColor = await BCMSRepo.color.add(color);
    if (!addedColor) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('grp003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.COLOR,
      BCMSEventConfigMethod.ADD,
      color,
    );
    await BCMSSocketManager.emit.color({
      colorId: addedColor._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('color');
    return addedColor;
  }
  static async update({
    sid,
    errorHandler,
    body,
    accessToken,
  }: {
    sid?: string;
    body: BCMSColorUpdateData;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
  }): Promise<BCMSColor> {
    const color = await BCMSRepo.color.findById(body._id);
    if (!color) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('col001', { id: body._id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label === 'string' && body.label !== color.label) {
      changeDetected = true;
      color.label = body.label;
      color.name = StringUtility.toSlugUnderscore(body.label);
    }
    if (typeof body.value === 'string' && body.value !== color.value) {
      if (!(BCMSColorService.check(body.value))) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('col010'),
        );
      }
      changeDetected = true;
      color.value = body.value;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const updatedColor = await BCMSRepo.color.update(color);
    if (!updatedColor) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('col005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.COLOR,
      BCMSEventConfigMethod.UPDATE,
      color,
    );
    await BCMSSocketManager.emit.color({
      colorId: updatedColor._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('color');

    return updatedColor;
  }
  static async delete({
    sid,
    errorHandler,
    id,
    accessToken,
  }: {
    sid?: string;
    id: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
  }): Promise<void> {
    const color = await BCMSRepo.color.findById(id);
    if (!color) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('col001', { id: id }),
      );
    }
    const deleteResult = await BCMSRepo.color.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('col006'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.COLOR,
      BCMSEventConfigMethod.DELETE,
      color,
    );
    await BCMSSocketManager.emit.color({
      colorId: color._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('color');
  }
}
