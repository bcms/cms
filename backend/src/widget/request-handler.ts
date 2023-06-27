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
  BCMSUserCustomPool,
  BCMSWidget,
  BCMSWidgetCreateData,
  BCMSWidgetUpdateData,
} from '@backend/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus, Logger } from '@becomes/purple-cheetah/types';

export class BCMSWidgetRequestHandler {
  static async getAll(): Promise<BCMSWidget[]> {
    return await BCMSRepo.widget.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSWidget[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.widget.findAllById(ids);
    } else {
      return await BCMSRepo.widget.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.widget.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSWidget> {
    const widget =
      id.length === 24
        ? await BCMSRepo.widget.findById(id)
        : await BCMSRepo.widget.methods.findByCid(id);
    if (!widget) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('wid001', { id }),
      );
    }
    return widget;
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
    body: BCMSWidgetCreateData;
  }): Promise<BCMSWidget> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('widgets');
    if (!idc) {
      const widgetIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'widgets',
        name: 'Widgets',
      });
      const addIdcResult = await BCMSRepo.idc.add(widgetIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const widget = BCMSFactory.widget.create({
      cid: idc.toString(16),
      desc: body.desc,
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      previewImage: body.previewImage,
      previewScript: body.previewScript,
      previewStyle: body.previewStyle,
    });
    if (await BCMSRepo.widget.methods.findByName(widget.name)) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('wid002', { name: widget.name }),
      );
    }
    const addedWidget = await BCMSRepo.widget.add(widget);
    if (!addedWidget) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('wid003'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.WIDGET,
      BCMSEventConfigMethod.ADD,
      addedWidget,
    );
    await BCMSSocketManager.emit.widget({
      widgetId: addedWidget._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('widget');
    return addedWidget;
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
    body: BCMSWidgetUpdateData;
  }): Promise<BCMSWidget> {
    const id = body._id;
    const widget = await BCMSRepo.widget.findById(id);
    if (!widget) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('wid001', { id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label === 'string' && body.label !== widget.label) {
      const name = StringUtility.toSlugUnderscore(body.label);
      if (widget.name !== name) {
        if (await BCMSRepo.widget.methods.findByName(name)) {
          throw errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            bcmsResCode('wid002', { name: widget.name }),
          );
        }
      }
      changeDetected = true;
      widget.label = body.label;
      widget.name = name;
    }
    if (typeof body.desc !== 'undefined' && body.desc !== widget.desc) {
      changeDetected = true;
      widget.desc = body.desc;
    }
    if (
      typeof body.previewImage === 'string' &&
      body.previewImage !== widget.previewImage
    ) {
      changeDetected = true;
      widget.previewImage = body.previewImage;
    }
    if (
      typeof body.previewScript === 'string' &&
      body.previewScript !== widget.previewScript
    ) {
      changeDetected = true;
      widget.previewScript = body.previewScript;
    }
    if (
      typeof body.previewStyle === 'string' &&
      body.previewStyle !== widget.previewStyle
    ) {
      changeDetected = true;
      widget.previewStyle = body.previewStyle;
    }
    if (
      typeof body.propChanges !== 'undefined' &&
      body.propChanges.length > 0
    ) {
      changeDetected = true;
      const changes = await BCMSPropHandler.applyPropChanges(
        widget.props,
        body.propChanges,
        'widget.props',
      );
      if (changes instanceof Error) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('g009', {
            msg: changes.message,
          }),
        );
      }
      widget.props = changes;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const hasInfiniteLoop = await BCMSPropHandler.testInfiniteLoop(
      widget.props,
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
      widget.props,
      widget.props,
      'widget.props',
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
    const updatedWidget = await BCMSRepo.widget.update(widget);
    if (!updatedWidget) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('wid005'),
      );
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.WIDGET,
      BCMSEventConfigMethod.UPDATE,
      updatedWidget,
    );
    await BCMSSocketManager.emit.widget({
      widgetId: updatedWidget._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('widget');
    return updatedWidget;
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
    const widget = await BCMSRepo.widget.findById(id);
    if (!widget) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('wid001', { id }),
      );
    }
    const deleteResult = await BCMSRepo.widget.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('wid006'),
      );
    }
    const errors = await BCMSPropHandler.removeWidget({
      widgetId: widget._id,
    });
    if (errors) {
      logger.error(name, errors);
    }
    BCMSEventManager.emit(
      BCMSEventConfigScope.WIDGET,
      BCMSEventConfigMethod.DELETE,
      widget,
    );
    await BCMSSocketManager.emit.widget({
      widgetId: widget._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId + '_' + sid],
    });
    await BCMSRepo.change.methods.updateAndIncByName('widget');
  }
}
