import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSRouteProtection } from '../util';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusCreateDataSchema,
  BCMSStatusUpdateData,
  BCMSStatusUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { BCMSStatusRequestHandler } from './request-handler';

export const BCMSStatusController = createController({
  name: 'Status controller',
  path: '/api/status',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSStatus[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSStatusRequestHandler.getAll(),
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
            count: await BCMSStatusRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSStatus }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSStatusRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSStatusCreateData>,
        { item: BCMSStatus }
      >({
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSStatusCreateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSStatusRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSStatusUpdateData>,
        { item: BCMSStatus }
      >({
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSStatusUpdateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSStatusRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              body,
              errorHandler,
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
        async handler({ request, errorHandler, accessToken }) {
          await BCMSStatusRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            errorHandler,
            id: request.params.id,
            accessToken,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
