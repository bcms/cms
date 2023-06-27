import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSRouteProtection } from '../util';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSUserCustomPool,
  BCMSWidget,
  BCMSWidgetCreateData,
  BCMSWidgetCreateDataSchema,
  BCMSWidgetUpdateData,
  BCMSWidgetUpdateDataSchema,
} from '../types';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSWidgetRequestHandler } from './request-handler';

export const BCMSWidgetController = createController({
  name: 'Widget controller',
  path: '/api/widget',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods() {
    return {
      whereIsItUsed: createControllerMethod({
        path: '/:id/where-is-it-used',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          let widget: BCMSWidget | null = null;
          if (id.length === 24) {
            widget = await BCMSRepo.widget.findById(id);
          } else {
            widget = await BCMSRepo.widget.methods.findByCid(id);
          }
          if (!widget) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('wid001', { id }),
            );
          }
          const entries = await BCMSRepo.entry.methods.findAllByWidgetId(
            widget._id,
          );

          return {
            entryIds: entries.map((e) => {
              return { _id: e._id, cid: e.cid, tid: e.templateId };
            }),
          };
        },
      }),

      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSWidget[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSWidgetRequestHandler.getAll(),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSWidget[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSWidgetRequestHandler.getMany(ids),
          };
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSWidgetRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSWidget }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSWidgetRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSWidgetCreateData>,
        { item: BCMSWidget }
      >({
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSWidgetCreateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSWidgetRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSWidgetUpdateData>,
        { item: BCMSWidget }
      >({
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSWidgetUpdateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSWidgetRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          await BCMSWidgetRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            id: request.params.id,
            errorHandler,
            accessToken,
            logger,
            name,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
