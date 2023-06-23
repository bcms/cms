import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSApiKey,
  BCMSApiKeyAddData,
  BCMSApiKeyUpdateData,
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@backend/types';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSApiKeyRequestHandler {
  static async count(): Promise<number> {
    return await BCMSRepo.apiKey.count();
  }
  static async getAll(): Promise<BCMSApiKey[]> {
    return await BCMSRepo.apiKey.findAll();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSApiKey> {
    const key = await BCMSRepo.apiKey.findById(id);
    if (!key) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('ak001', { id }),
      );
    }
    return key;
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
    body: BCMSApiKeyAddData;
  }): Promise<BCMSApiKey> {
    const rewriteResult = BCMSFactory.apiKey.rewriteKey(
      BCMSFactory.apiKey.create({
        userId: accessToken.payload.userId,
        name: body.name,
        desc: body.desc,
        blocked: body.blocked,
        access: body.access,
      }),
    );
    const key = await BCMSRepo.apiKey.add(rewriteResult.key);
    if (!key) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('ak003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.API_KEY,
      BCMSEventConfigMethod.ADD,
      key,
    );
    await BCMSSocketManager.emit.apiKey({
      apiKeyId: key._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    return key;
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
    body: BCMSApiKeyUpdateData;
  }): Promise<BCMSApiKey> {
    const key = await BCMSRepo.apiKey.findById(body._id);
    if (!key) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('ak001', { id: body._id }),
      );
    }
    let changeDetected = false;
    if (typeof body.name !== 'undefined' && body.name !== key.name) {
      changeDetected = true;
      key.name = body.name;
    }
    if (typeof body.desc !== 'undefined' && body.desc !== key.desc) {
      changeDetected = true;
      key.desc = body.desc;
    }
    if (typeof body.blocked !== 'undefined' && body.blocked !== key.blocked) {
      changeDetected = true;
      key.blocked = body.blocked;
    }
    if (typeof body.access !== 'undefined') {
      changeDetected = true;
      key.access = body.access;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const updatedKey = await BCMSRepo.apiKey.update(key);
    if (!updatedKey) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('ak005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.API_KEY,
      BCMSEventConfigMethod.UPDATE,
      key,
    );
    await BCMSSocketManager.emit.apiKey({
      apiKeyId: updatedKey._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    return updatedKey;
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
    const key = await BCMSRepo.apiKey.findById(id);
    if (!key) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('ak001', { id }),
      );
    }
    if (!(await BCMSRepo.apiKey.deleteById(id))) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('ak006'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.API_KEY,
      BCMSEventConfigMethod.DELETE,
      key,
    );
    await BCMSSocketManager.emit.apiKey({
      apiKeyId: key._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
  }
}
