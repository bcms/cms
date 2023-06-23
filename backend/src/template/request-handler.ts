import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSPropHandler } from '@backend/prop';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSApiKey,
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSSocketEventType,
  BCMSTemplate,
  BCMSTemplateCreateData,
  BCMSTemplateUpdateData,
  BCMSUserCustomPool,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus, Logger } from '@becomes/purple-cheetah/types';

export class BCMSTemplateRequestHandler {
  static async getAll({ key }: { key?: BCMSApiKey }): Promise<BCMSTemplate[]> {
    if (key) {
      const templateIds = key.access.templates
        .filter((e) => e.get)
        .map((e) => e._id);
      return await BCMSRepo.template.findAllById(templateIds);
    }
    return await BCMSRepo.template.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSTemplate[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.template.findAllById(ids);
    } else {
      return await BCMSRepo.template.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.template.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTemplate> {
    const template =
      id.length === 24
        ? await BCMSRepo.template.findById(id)
        : await BCMSRepo.template.methods.findByCid(id);
    if (!template) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tmp001', { id }),
      );
    }
    return template;
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
    body: BCMSTemplateCreateData;
  }): Promise<BCMSTemplate> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('templates');
    if (!idc) {
      const templateIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'templates',
        name: 'Templates',
      });
      const addIdcResult = await BCMSRepo.idc.add(templateIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const template = BCMSFactory.template.create({
      cid: idc.toString(16),
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      desc: body.desc,
      singleEntry: body.singleEntry,
      userId: accessToken.payload.userId,
    });
    const templateWithSameName = await BCMSRepo.template.methods.findByName(
      template.name,
    );
    if (templateWithSameName) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('tmp002', { name: template.name }),
      );
    }
    const addedTemplate = await BCMSRepo.template.add(template);
    if (!addedTemplate) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tmp003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TEMPLATE,
      BCMSEventConfigMethod.ADD,
      template,
    );
    await BCMSSocketManager.emit.template({
      templateId: addedTemplate._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('templates');
    return addedTemplate;
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
    body: BCMSTemplateUpdateData;
  }): Promise<BCMSTemplate> {
    const id = body._id;
    const template = await BCMSRepo.template.findById(id);
    if (!template) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tmp001', { id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label !== 'undefined' && body.label !== template.label) {
      const name = StringUtility.toSlugUnderscore(body.label);
      if (template.name !== name) {
        if (await BCMSRepo.template.methods.findByName(name)) {
          throw errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            bcmsResCode('tmp002', { name: template.name }),
          );
        }
      }
      changeDetected = true;
      template.label = body.label;
      template.name = name;
    }
    if (typeof body.desc !== 'undefined' && template.desc !== body.desc) {
      changeDetected = true;
      template.desc = body.desc;
    }
    if (
      typeof body.singleEntry !== 'undefined' &&
      template.singleEntry !== body.singleEntry
    ) {
      changeDetected = true;
      template.singleEntry = body.singleEntry;
    }
    if (
      typeof body.propChanges !== 'undefined' &&
      body.propChanges.length > 0
    ) {
      // for (let i = 0; i < body.propChanges.length; i++) {
      //   const change = body.propChanges[i];
      //   if (change.add) {
      //     const name = StringUtility.toSlugUnderscore(change.add.label);
      //     if (name === 'title' || name === 'slug') {
      //       throw errorHandler.occurred(
      //         HTTPStatus.FORBIDDEN,
      //         bcmsResCode('tmp009', {
      //           name,
      //         }),
      //       );
      //     }
      //   } else if (change.update) {
      //     if (
      //       change.update.label === 'Title' ||
      //       change.update.label === 'Slug'
      //     ) {
      //       throw errorHandler.occurred(
      //         HTTPStatus.FORBIDDEN,
      //         bcmsResCode('tmp009', {
      //           name: change.update.label,
      //         }),
      //       );
      //     }
      //   } else if (change.remove) {
      //     if (change.remove === 'title' || change.remove === 'slug') {
      //       throw errorHandler.occurred(
      //         HTTPStatus.FORBIDDEN,
      //         bcmsResCode('tmp009', {
      //           name: change.remove,
      //         }),
      //       );
      //     }
      //   }
      // }
      changeDetected = true;
      const result = await BCMSPropHandler.applyPropChanges(
        template.props,
        body.propChanges,
        undefined,
        true,
      );
      if (result instanceof Error) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('g009', {
            msg: result.message,
          }),
        );
      }
      template.props = result;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const hasInfiniteLoop = await BCMSPropHandler.testInfiniteLoop(
      template.props,
    );
    if (hasInfiniteLoop instanceof Error) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('g008', {
          msg: hasInfiniteLoop.message,
        }),
      );
    }
    const checkProps = await BCMSPropHandler.propsChecker(
      template.props,
      template.props,
      'template.props',
      true,
    );
    if (checkProps instanceof Error) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('g007', {
          msg: checkProps.message,
        }),
      );
    }
    const updatedTemplate = await BCMSRepo.template.update(template);
    if (!updatedTemplate) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tmp005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TEMPLATE,
      BCMSEventConfigMethod.UPDATE,
      template,
    );
    await BCMSSocketManager.emit.template({
      templateId: updatedTemplate._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('templates');
    return updatedTemplate;
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
    const template = await BCMSRepo.template.findById(id);
    if (!template) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tmp001', { id }),
      );
    }
    const deleteResult = await BCMSRepo.template.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tmp006'),
      );
    }
    await BCMSRepo.entry.methods.deleteAllByTemplateId(id);
    const errors = await BCMSPropHandler.removeEntryPointer({
      templateId: id,
    });
    if (errors) {
      logger.error(name, errors);
    }

    const keys = await BCMSRepo.apiKey.findAll();
    const updateKeys: BCMSApiKey[] = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.access.templates.find((e) => e._id === template._id)) {
        key.access.templates = key.access.templates.filter(
          (e) => e._id !== template._id,
        );
        updateKeys.push(key);
      }
    }
    for (let i = 0; i < updateKeys.length; i++) {
      const key = updateKeys[i];
      await BCMSRepo.apiKey.update(key);
      await BCMSSocketManager.emit.apiKey({
        apiKeyId: key._id,
        type: BCMSSocketEventType.UPDATE,
        userIds: 'all',
      });
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.TEMPLATE,
      BCMSEventConfigMethod.DELETE,
      template,
    );
    await BCMSSocketManager.emit.template({
      templateId: template._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('templates');
  }
}
