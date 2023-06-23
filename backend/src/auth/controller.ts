import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import {
  createController,
  createControllerMethod,
  useRefreshTokenService,
} from '@becomes/purple-cheetah';
import { useJwt, useJwtEncoding } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTEncoding,
  JWTError,
  JWTManager,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, RefreshTokenService } from '@becomes/purple-cheetah/types';

interface Setup {
  rt: RefreshTokenService;
  jwtManager: JWTManager;
  jwtEncoder: JWTEncoding;
}

export const BCMSAuthController = createController<Setup>({
  name: 'Auth controller',
  path: '/api/auth',
  setup() {
    return {
      rt: useRefreshTokenService(),
      jwtManager: useJwt(),
      jwtEncoder: useJwtEncoding(),
    };
  },
  methods({ rt, jwtManager, jwtEncoder }) {
    return {
      refreshAccess: createControllerMethod<void, { accessToken: string }>({
        path: '/token/refresh/:userId',
        type: 'post',
        async handler({ request, errorHandler }) {
          if (typeof request.headers.authorization !== 'string') {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('a001'),
            );
          }
          const tokenValid = rt.exist(
            request.params.userId,
            (request.headers.authorization as string).replace('Bearer ', ''),
          );
          if (!tokenValid) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('a005'),
            );
          }
          const user = await BCMSRepo.user.findById(request.params.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('u002', { id: request.params.userId }),
            );
          }
          const accessToken = jwtManager.create({
            userId: user._id,
            roles: user.roles,
            props: user.customPool,
            issuer: BCMSConfig.jwt.scope,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to create access token',
            );
          }
          return {
            accessToken: jwtEncoder.encode(accessToken),
          };
        },
      }),

      logout: createControllerMethod<void, { ok: boolean }>({
        path: '/logout/:userId',
        type: 'post',
        async handler({ request, errorHandler }) {
          if (typeof request.headers.authorization !== 'string') {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('a001'),
            );
          }
          rt.remove(
            request.params.userId,
            (request.headers.authorization as string).replace('Bearer ', ''),
          );
          return {
            ok: true,
          };
        },
      }),
    };
  },
});
