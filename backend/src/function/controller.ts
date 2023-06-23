import { bcmsResCode } from '@backend/response-code';
import { BCMSApiKeySecurity } from '@backend/security';
import { BCMSRouteProtection } from '@backend/util';
import {
  createController,
  createControllerMethod,
  createHTTPError,
  useLogger,
} from '@becomes/purple-cheetah';
import {
  useJwt,
} from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPException, HTTPStatus } from '@becomes/purple-cheetah/types';
import type {
  BCMSApiKey,
  BCMSUserCustomPool,
  BCMSFunctionManager,
  BCMSFunctionConfig,
} from '../types';
import { useBcmsFunctionManger } from './main';

interface Setup {
  fnManager: BCMSFunctionManager;
  jwt: JWTManager;
}

export const BCMSFunctionController = createController<Setup>({
  name: 'Function controller',
  path: '/api/function',
  setup() {
    return {
      fnManager: useBcmsFunctionManger(),
      jwt: useJwt(),
    };
  },
  methods({ fnManager, jwt }) {
    return {
      getAvailable: createControllerMethod({
        path: '/available',
        type: 'get',
        preRequestHandler:
          BCMSRouteProtection.createJwtPreRequestHandler(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            functions: fnManager.getAll().map((e) => {
              return {
                name: e.config.name,
                public: !!e.config.public,
              };
            }),
          };
        },
      }),
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSFunctionConfig[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: fnManager.getAll().map((e) => {
              return e.config;
            }),
          };
        },
      }),
      execute: createControllerMethod<unknown, unknown>({
        path: '/:name',
        type: 'post',
        async handler({ request, errorHandler, logger, name }) {
          const fnName = request.params.name;
          const fn = fnManager.get(fnName);
          if (!fn) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('fn001', { name: request.params.name }),
            );
          }
          let apiKey: BCMSApiKey | null = null;
          let at: JWT<BCMSUserCustomPool> | null = null;
          if (!fn.config.public) {
            if (request.headers.authorization) {
              const accessToken = jwt.get<BCMSUserCustomPool>({
                jwtString: request.headers.authorization,
                roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
                permissionName: JWTPermissionName.READ,
              });
              if (accessToken instanceof JWTError) {
                throw errorHandler.occurred(
                  HTTPStatus.UNAUTHORIZED,
                  bcmsResCode('g001', {
                    msg: accessToken.message,
                  }),
                );
              }
              at = accessToken;
            } else {
              try {
                apiKey = await BCMSApiKeySecurity.verify(
                  BCMSApiKeySecurity.httpRequestToApiKeyRequest(request),
                );
              } catch (err) {
                const e = err as Error;
                throw errorHandler.occurred(
                  HTTPStatus.UNAUTHORIZED,
                  bcmsResCode('ak007', { msg: e.message }),
                );
              }
            }
          }

          try {
            const fnLogger = useLogger({
              name: fn.config.name,
            });
            return {
              success: true,
              result: await fn.handler({
                request,
                logger: fnLogger,
                errorHandler: createHTTPError({
                  logger: fnLogger,
                  place: fn.config.name,
                }),
                auth: apiKey ? apiKey : (at as JWT<BCMSUserCustomPool>),
              }),
            };
          } catch (error) {
            const e = error as HTTPException<unknown>;
            if (e.message && e.stack && e.status) {
              e.message = {
                result: e.message,
                success: false,
              };
              throw error;
            }
            logger.error(name, error);
            throw errorHandler.occurred(HTTPStatus.INTERNAL_SERVER_ERROR, {
              success: false,
              result: (error as Error).message,
            });
          }
        },
      }),
    };
  },
});
