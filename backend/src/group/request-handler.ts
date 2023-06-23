import { BCMSEventManager } from '@backend/event';
import { BCMSFactory } from '@backend/factory';
import { BCMSPropHandler } from '@backend/prop';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSGroup,
  BCMSGroupAddData,
  BCMSGroupLite,
  BCMSGroupUpdateData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus, Logger } from '@becomes/purple-cheetah/types';
export class BCMSGroupRequestHandler {
  static async getAll(): Promise<BCMSGroup[]> {
    return await BCMSRepo.group.findAll();
  }
  static async getAllLite(): Promise<BCMSGroupLite[]> {
    return (await BCMSRepo.group.findAll()).map((e) =>
      BCMSFactory.group.toLite(e),
    );
  }
  static async getMany(ids: string[]): Promise<BCMSGroup[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.group.findAllById(ids);
    } else {
      return await BCMSRepo.group.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.group.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSGroup> {
    const group = await BCMSRepo.group.findById(id);
    if (!group) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('grp001', { id: id }),
      );
    }
    return group;
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
    body: BCMSGroupAddData;
  }): Promise<BCMSGroup> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('groups');
    if (!idc) {
      const groupIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'groups',
        name: 'Groups',
      });
      const addIdcResult = await BCMSRepo.idc.add(groupIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const group = BCMSFactory.group.create({
      cid: idc.toString(16),
      desc: body.desc,
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
    });
    if (await BCMSRepo.group.methods.findByName(group.name)) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('grp002', { name: group.name }),
      );
    }
    const addedGroup = await BCMSRepo.group.add(group);
    if (!addedGroup) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('grp003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.GROUP,
      BCMSEventConfigMethod.ADD,
      group,
    );
    await BCMSSocketManager.emit.group({
      groupId: addedGroup._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('group');
    return addedGroup;
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
    body: BCMSGroupUpdateData;
  }): Promise<BCMSGroup> {
    const group = await BCMSRepo.group.findById(body._id);
    if (!group) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('grp001', { id: body._id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label !== 'undefined' && body.label !== group.label) {
      const name = StringUtility.toSlugUnderscore(body.label);
      if (group.name !== name) {
        if (await BCMSRepo.group.methods.findByName(name)) {
          throw errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            bcmsResCode('grp002', { name: group.name }),
          );
        }
      }
      changeDetected = true;
      group.label = body.label;
      group.name = name;
    }
    if (typeof body.desc === 'string' && body.desc !== group.desc) {
      changeDetected = true;
      group.desc = body.desc;
    }
    if (
      typeof body.propChanges !== 'undefined' &&
      body.propChanges.length > 0
    ) {
      changeDetected = true;
      const updatedProps = await BCMSPropHandler.applyPropChanges(
        group.props,
        body.propChanges,
        `(group: ${group.name}).props`,
      );
      if (updatedProps instanceof Error) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('g009', {
            msg: updatedProps.message,
          }),
        );
      }
      group.props = updatedProps;
    }

    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const infiniteLoopResult = await BCMSPropHandler.testInfiniteLoop(
      group.props,
      {
        group: [
          {
            _id: group._id,
            label: group.label,
          },
        ],
      },
    );
    if (infiniteLoopResult instanceof Error) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('g008', {
          msg: infiniteLoopResult.message,
        }),
      );
    }
    const checkPropsResult = await BCMSPropHandler.propsChecker(
      group.props,
      group.props,
      'group.props',
      true,
    );
    if (checkPropsResult instanceof Error) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('g007', {
          msg: checkPropsResult.message,
        }),
      );
    }
    const updatedGroup = await BCMSRepo.group.update(group);
    if (!updatedGroup) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('grp005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.GROUP,
      BCMSEventConfigMethod.UPDATE,
      group,
    );
    await BCMSSocketManager.emit.group({
      groupId: updatedGroup._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('group');
    return updatedGroup;
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
    const group = await BCMSRepo.group.findById(id);
    if (!group) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('grp001', { id }),
      );
    }
    const deleteResult = await BCMSRepo.group.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('grp006'),
      );
    }
    const errors = await BCMSPropHandler.removeGroupPointer({
      groupId: group._id,
    });
    if (errors) {
      logger.error(name, errors);
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.GROUP,
      BCMSEventConfigMethod.UPDATE,
      group,
    );
    await BCMSSocketManager.emit.group({
      groupId: group._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('group');
  }
}
