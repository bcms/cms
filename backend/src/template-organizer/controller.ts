import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerCreateDataSchema,
  BCMSTemplateOrganizerUpdateData,
  BCMSTemplateOrganizerUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { BCMSRouteProtection } from '../util';
import { BCMSTemplateOrganizerRequestHandler } from './request-handler';

export const BCMSTemplateOrganizerController = createController({
  name: 'Template organizer controller',
  path: '/api/template/organizer',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplateOrganizer[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSTemplateOrganizerRequestHandler.getAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplateOrganizer[] }
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
            items: await BCMSTemplateOrganizerRequestHandler.getMany(ids),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTemplateOrganizer }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),
      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSTemplateOrganizerCreateData>,
        { item: BCMSTemplateOrganizer }
      >({
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            bodySchema: BCMSTemplateOrganizerCreateDataSchema,
            permissionName: JWTPermissionName.WRITE,
            roleNames: [JWTRoleName.ADMIN],
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              errorHandler,
              body,
              accessToken,
            }),
          };
        },
      }),
      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSTemplateOrganizerUpdateData>,
        { item: BCMSTemplateOrganizer }
      >({
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            bodySchema: BCMSTemplateOrganizerUpdateDataSchema,
            permissionName: JWTPermissionName.WRITE,
            roleNames: [JWTRoleName.ADMIN],
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
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
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          await BCMSTemplateOrganizerRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
            id: request.params.id,
            errorHandler,
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
