import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import {
  BCMSProtectedUser,
  BCMSUserCustomPool,
  BCMSUserUpdateDataSchema,
  BCMSUserUpdateData,
  BCMSUser,
  BCMSSocketEventType,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../types';
import {
  JWT,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSRepo } from '@backend/repo';
import { BCMSFactory } from '@backend/factory';
import { bcmsResCode } from '@backend/response-code';
import { BCMSSocketManager } from '@backend/socket';
import { BCMSRouteProtection } from '@backend/util';
import { BCMSEventManager } from '@backend/event';

interface Setup {
  objectUtil: ObjectUtility;
}

export const BCMSUserController = createController<Setup>({
  name: 'User controller',
  path: '/api/user',
  setup() {
    return {
      objectUtil: useObjectUtility(),
    };
  },
  methods({ objectUtil }) {
    return {
      count: createControllerMethod<unknown, { count: number }>({
        path: '/count',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSRepo.user.count(),
          };
        },
      }),
      getAll: createControllerMethod<unknown, { items: BCMSProtectedUser[] }>({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: (await BCMSRepo.user.findAll()).map((e: BCMSUser) => {
              return BCMSFactory.user.toProtected(e);
            }),
          };
        },
      }),
      get: createControllerMethod<
        { accessToken: JWT<BCMSUserCustomPool> },
        { item: BCMSProtectedUser }
      >({
        path: '',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ accessToken, errorHandler }) {
          const user = await BCMSRepo.user.findById(accessToken.payload.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('u001'),
            );
          }
          return {
            item: BCMSFactory.user.toProtected(user),
          };
        },
      }),
      getById: createControllerMethod<unknown, { item: BCMSProtectedUser }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const user = await BCMSRepo.user.findById(request.params.id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('g002', { id: request.params.id }),
            );
          }
          return {
            item: BCMSFactory.user.toProtected(user),
          };
        },
      }),
      update: createControllerMethod<
        { accessToken: JWT<BCMSUserCustomPool> },
        { item: BCMSProtectedUser }
      >({
        path: '',
        type: 'put',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler, accessToken }) {
          const data: BCMSUserUpdateData = request.body;
          {
            const checkBody = objectUtil.compareWithSchema(
              request.body,
              BCMSUserUpdateDataSchema,
              'body',
            );
            if (checkBody instanceof ObjectUtilityError) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('g002', {
                  msg: checkBody.message,
                }),
              );
            }
          }
          if (
            accessToken.payload.userId !== data._id &&
            !accessToken.payload.rls.find(
              (role) => role.name === JWTRoleName.ADMIN,
            )
          ) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('u003'),
            );
          }
          const user = await BCMSRepo.user.findById(data._id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('u002', { id: request.params.id }),
            );
          }
          let change = false;
          if (typeof data.customPool !== 'undefined') {
            if (typeof data.customPool.policy !== 'undefined') {
              if (
                !accessToken.payload.rls.find(
                  (role) => role.name === JWTRoleName.ADMIN,
                )
              ) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  bcmsResCode('u008'),
                );
              }
              if (typeof data.customPool.policy.templates !== 'undefined') {
                change = true;
                user.customPool.policy.templates =
                  data.customPool.policy.templates;
              }
              if (typeof data.customPool.policy.media !== 'undefined') {
                change = true;
                user.customPool.policy.media = data.customPool.policy.media;
              }
              if (typeof data.customPool.policy.plugins !== 'undefined') {
                change = true;
                user.customPool.policy.plugins = data.customPool.policy.plugins;
              }
            }
          }
          if (!change) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g003'),
            );
          }
          const updatedUser = await BCMSRepo.user.update(user);
          BCMSEventManager.emit(
            BCMSEventConfigScope.USER,
            BCMSEventConfigMethod.UPDATE,
            updatedUser,
          );
          const sid = request.headers['x-bcms-sid'] as string;
          await BCMSSocketManager.emit.user({
            userId: updatedUser._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId + '_' + sid],
          });
          await BCMSSocketManager.emit.refresh({
            userId: user._id,
          });
          return {
            item: BCMSFactory.user.toProtected(updatedUser),
          };
        },
      }),
    };
  },
});
