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
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, RefreshTokenService } from '@becomes/purple-cheetah/types';
import { BCMSRouteProtection } from '@backend/util';
import type { BCMSRouteProtectionBodyCheckResult } from '@backend/types';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { BCMSFactory } from '@backend/factory';

interface Setup {
  rt: RefreshTokenService;
  jwtManager: JWTManager;
  jwtEncoder: JWTEncoding;
}

let createAdminServerToken: string | null = null;

export function setAuthCreateAdminServerToken(): string {
  createAdminServerToken = crypto
    .createHash('sha512')
    .update(crypto.randomBytes(16).toString('hex') + Date.now())
    .digest('hex');
  return createAdminServerToken;
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
      shouldSignUp: createControllerMethod<void, { yes: boolean }>({
        path: '/should-signup',
        type: 'get',
        async handler() {
          return { yes: !!createAdminServerToken };
        },
      }),

      signUpAdmin: createControllerMethod<
        BCMSRouteProtectionBodyCheckResult<{
          serverToken: string;
          email: string;
          password: string;
          firstName: string;
          lastName: string;
        }>,
        { accessToken: string; refreshToken: string }
      >({
        path: '/signup-admin',
        type: 'post',
        preRequestHandler: BCMSRouteProtection.createBodyCheckPreRequestHandler(
          {
            bodySchema: {
              serverToken: {
                __type: 'string',
                __required: true,
              },
              email: {
                __type: 'string',
                __required: true,
              },
              password: {
                __type: 'string',
                __required: true,
              },
              firstName: {
                __type: 'string',
                __required: true,
              },
              lastName: {
                __type: 'string',
                __required: true,
              },
            },
          },
        ),
        async handler({ body, errorHandler }) {
          if (body.serverToken !== createAdminServerToken) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              'Invalid server token',
            );
          }
          const user = await BCMSRepo.user.add(
            BCMSFactory.user.create({
              roles: [
                {
                  name: JWTRoleName.ADMIN,
                  permissions: [
                    {
                      name: JWTPermissionName.DELETE,
                    },
                    {
                      name: JWTPermissionName.EXECUTE,
                    },
                    {
                      name: JWTPermissionName.READ,
                    },
                    {
                      name: JWTPermissionName.WRITE,
                    },
                  ],
                },
              ],
              customPool: {
                address: {},
                personal: {
                  firstName: body.firstName,
                  lastName: body.lastName,
                  avatarUri: '',
                },
                policy: {
                  media: {
                    get: false,
                    delete: false,
                    post: false,
                    put: false,
                  },
                  templates: [],
                },
              },
              password: await bcrypt.hash(body.password, 10),
              email: body.email,
              username: body.firstName + ' ' + body.lastName,
            }),
          );
          if (!(await BCMSRepo.language.methods.findByCode('en'))) {
            await BCMSRepo.language.add(
              BCMSFactory.language.create({
                name: 'English',
                userId: 'admin',
                code: 'en',
                nativeName: 'English',
                def: true,
              }),
            );
          }
          if ((await BCMSRepo.status.findAll()).length === 0) {
            await BCMSRepo.status.add(
              BCMSFactory.status.create({
                label: 'Published',
                name: 'published',
              }),
            );
            await BCMSRepo.status.add(
              BCMSFactory.status.create({
                label: 'Draft',
                name: 'draft',
              }),
            );
          }
          createAdminServerToken = null;
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
            refreshToken: rt.create(user._id),
          };
        },
      }),

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

      login: createControllerMethod<
        BCMSRouteProtectionBodyCheckResult<{ email: string; password: string }>,
        { accessToken: string; refreshToken: string }
      >({
        path: '/login',
        type: 'post',
        preRequestHandler: BCMSRouteProtection.createBodyCheckPreRequestHandler(
          {
            bodySchema: {
              email: {
                __type: 'string',
                __required: true,
              },
              password: {
                __type: 'string',
                __required: true,
              },
            },
          },
        ),
        async handler({ body, errorHandler }) {
          const user = await BCMSRepo.user.methods.findByEmail(body.email);
          if (!user) {
            if (!user) {
              throw errorHandler.occurred(
                HTTPStatus.UNAUTHORIZED,
                `Wrong email and/or password`,
              );
            }
          }
          if (!(await bcrypt.compare(body.password, user.password))) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              `Wrong email and/or password`,
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
            refreshToken: rt.create(user._id),
          };
        },
      }),
    };
  },
});
