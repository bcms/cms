import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSSocketEventType,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerUpdateData,
  BCMSUserCustomPool,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSTemplateOrganizerRequestHandler {
  static async getAll(): Promise<BCMSTemplateOrganizer[]> {
    return await BCMSRepo.templateOrganizer.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSTemplateOrganizer[]> {
    return await BCMSRepo.templateOrganizer.findAllById(ids);
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTemplateOrganizer> {
    const tempOrg = await BCMSRepo.templateOrganizer.findById(id);
    if (!tempOrg) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tpo001', { id }),
      );
    }
    return tempOrg;
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
    body: BCMSTemplateOrganizerCreateData;
  }): Promise<BCMSTemplateOrganizer> {
    const org = BCMSFactory.templateOrganizer.create({
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      parentId: body.parentId,
      templateIds: body.templateIds,
    });
    const addedOrg = await BCMSRepo.templateOrganizer.add(org);
    if (!addedOrg) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tpo003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TEMPLATE_ORGANIZER,
      BCMSEventConfigMethod.ADD,
      addedOrg,
    );
    await BCMSSocketManager.emit.templateOrganizer({
      templateOrganizerId: addedOrg._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    return addedOrg;
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
    body: BCMSTemplateOrganizerUpdateData;
  }): Promise<BCMSTemplateOrganizer> {
    const tempOrg = await BCMSRepo.templateOrganizer.findById(body._id);
    if (!tempOrg) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tpo001', { id: body._id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label === 'string' && body.label !== tempOrg.label) {
      changeDetected = true;
      tempOrg.label = body.label;
      tempOrg.name = StringUtility.toSlugUnderscore(body.label);
    }
    if (
      typeof body.parentId === 'string' &&
      body.parentId !== tempOrg.parentId
    ) {
      changeDetected = true;
      tempOrg.parentId = body.parentId;
      const parentOrg = await BCMSRepo.templateOrganizer.findById(
        body.parentId,
      );
      if (!parentOrg) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('tpo001', { id: body.parentId }),
        );
      }
    }
    if (typeof body.templateIds === 'object') {
      changeDetected = true;
      tempOrg.templateIds = body.templateIds;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const updatedTempOrg = await BCMSRepo.templateOrganizer.update(tempOrg);
    if (!updatedTempOrg) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tpo002'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TEMPLATE_ORGANIZER,
      BCMSEventConfigMethod.UPDATE,
      updatedTempOrg,
    );
    await BCMSSocketManager.emit.templateOrganizer({
      templateOrganizerId: updatedTempOrg._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    return updatedTempOrg;
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
    const tempOrg = await BCMSRepo.templateOrganizer.findById(id);
    if (!tempOrg) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tpo001', { id }),
      );
    }
    const deleteResult = await BCMSRepo.templateOrganizer.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tpo004'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TEMPLATE_ORGANIZER,
      BCMSEventConfigMethod.DELETE,
      tempOrg,
    );
    await BCMSSocketManager.emit.templateOrganizer({
      templateOrganizerId: tempOrg._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
  }
}
