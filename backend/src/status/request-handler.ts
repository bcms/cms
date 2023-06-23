import { BCMSColorService } from '@backend/color';
import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSSocketEventType,
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusUpdateData,
  BCMSUserCustomPool,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSStatusRequestHandler {
  static async getAll(): Promise<BCMSStatus[]> {
    return await BCMSRepo.status.findAll();
  }
  static async count(): Promise<number> {
    return await BCMSRepo.status.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSStatus> {
    const status = await BCMSRepo.status.findById(id);
    if (!status) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('sts001', {
          id,
        }),
      );
    }
    return status;
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
    body: BCMSStatusCreateData;
  }): Promise<BCMSStatus> {
    if (body.color) {
      if (!(BCMSColorService.check(body.color))) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('col010'),
        );
      }
    }
    const status = BCMSFactory.status.create({
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      color: body.color,
    });
    const statusWithSameName = await BCMSRepo.status.methods.findByName(
      status.name,
    );
    if (statusWithSameName) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('sts002', { name: status.name }),
      );
    }
    const addedStatus = await BCMSRepo.status.add(status);
    if (!addedStatus) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('sts003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.STATUS,
      BCMSEventConfigMethod.ADD,
      addedStatus,
    );
    await BCMSSocketManager.emit.status({
      statusId: addedStatus._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('status');
    return addedStatus;
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
    body: BCMSStatusUpdateData;
  }): Promise<BCMSStatus> {
    const id = body._id;
    const status = await BCMSRepo.status.findById(id);
    if (!status) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('sts001', {
          id,
        }),
      );
    }
    let changeDetected = false;
    if (typeof body.label === 'string' && status.label !== body.label) {
      changeDetected = true;
      const newName = StringUtility.toSlugUnderscore(body.label);
      if (status.name !== newName) {
        const statusWithSameName = await BCMSRepo.status.methods.findByName(
          newName,
        );
        if (statusWithSameName) {
          throw errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            bcmsResCode('sts002', { name: newName }),
          );
        }
        status.name = newName;
      }
      status.label = body.label;
    }
    if (typeof body.color === 'string' && status.color !== body.color) {
      if (!(BCMSColorService.check(body.color))) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('col010'),
        );
      }
      changeDetected = true;
      status.color = body.color;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, bcmsResCode('g003'));
    }
    const updatedStatus = await BCMSRepo.status.update(status);
    if (!updatedStatus) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('sts004'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.STATUS,
      BCMSEventConfigMethod.UPDATE,
      updatedStatus,
    );
    await BCMSSocketManager.emit.status({
      statusId: updatedStatus._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('status');
    return updatedStatus;
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
    const status = await BCMSRepo.status.findById(id);
    if (!status) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('sts001', {
          id,
        }),
      );
    }
    const deleteResult = await BCMSRepo.status.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('sts005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.STATUS,
      BCMSEventConfigMethod.DELETE,
      status,
    );
    await BCMSSocketManager.emit.status({
      statusId: status._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('status');
  }
}
