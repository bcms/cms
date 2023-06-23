import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSLanguage,
  BCMSLanguageAddData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@backend/types';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSLanguageRequestHandler {
  static async getAll(): Promise<BCMSLanguage[]> {
    return await BCMSRepo.language.findAll();
  }
  static async count(): Promise<number> {
    return await BCMSRepo.language.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSLanguage> {
    const lang = await BCMSRepo.language.findById(id);
    if (!lang) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('lng001', { id }),
      );
    }
    return lang;
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
    body: BCMSLanguageAddData;
  }): Promise<BCMSLanguage> {
    const language = BCMSFactory.language.create({
      name: body.name,
      code: body.code,
      nativeName: body.nativeName,
      def: false,
      userId: accessToken.payload.userId,
    });
    if (await BCMSRepo.language.methods.findByCode(language.code)) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('lng002', { code: language.code }),
      );
    }
    const addedLanguage = await BCMSRepo.language.add(language);
    if (!addedLanguage) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('lng003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.LANGUAGE,
      BCMSEventConfigMethod.ADD,
      addedLanguage,
    );
    await BCMSSocketManager.emit.language({
      languageId: addedLanguage._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('language');
    return addedLanguage;
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
    const lang = await BCMSRepo.language.findById(id);
    if (!lang) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('lng001', { id }),
      );
    }
    const deleteResult = await BCMSRepo.language.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('lng006'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.LANGUAGE,
      BCMSEventConfigMethod.DELETE,
      lang,
    );
    await BCMSSocketManager.emit.language({
      languageId: lang._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('language');
  }
}
