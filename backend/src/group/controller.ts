import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import {
  BCMSUserCustomPool,
  BCMSGroupAddData,
  BCMSGroupAddDataSchema,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataSchema,
  BCMSGroup,
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSGroupLite,
} from '../types';
import { BCMSRouteProtection } from '../util';
import { BCMSGroupRequestHandler } from './request-handler';

export const BCMSGroupController = createController({
  name: 'Group controller',
  path: '/api/group',
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
          let group: BCMSGroup | null;
          if (id.length === 24) {
            group = await BCMSRepo.group.findById(id);
          } else {
            group = await BCMSRepo.group.methods.findByCid(id);
          }
          if (!group) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('grp001', { id }),
            );
          }

          const groups = await BCMSRepo.group.methods.findAllByPropGroupPointer(
            group._id,
          );
          const templates =
            await BCMSRepo.template.methods.findAllByPropGroupPointer(
              group._id,
            );
          const widgets =
            await BCMSRepo.widget.methods.findAllByPropGroupPointer(group._id);

          return {
            groupIds: groups.map((e) => {
              return { cid: e.cid, _id: e._id };
            }),
            templateIds: templates.map((e) => {
              return { cid: e.cid, _id: e._id };
            }),
            widgetIds: widgets.map((e) => {
              return { cid: e.cid, _id: e._id };
            }),
          };
        },
      }),

      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGroup[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSGroupRequestHandler.getAll(),
          };
        },
      }),

      getAllLite: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGroupLite[] }
      >({
        path: '/all/lite',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSGroupRequestHandler.getAllLite(),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSGroup[] }
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
            items: await BCMSGroupRequestHandler.getMany(ids),
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
            count: await BCMSGroupRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSGroup }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const group = await BCMSGroupRequestHandler.getById({
            id: request.params.id,
            errorHandler,
          });
          return { item: group };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSGroupAddData>,
        { item: BCMSGroup }
      >({
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSGroupAddDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSGroupRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSGroupUpdateData>,
        { item: BCMSGroup }
      >({
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSGroupUpdateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSGroupRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      delete: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, logger, name, accessToken }) {
          await BCMSGroupRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            accessToken,
            errorHandler,
            id: request.params.id,
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
