import { BCMSRepo } from '@backend/repo';
import { bcmsResCode } from '@backend/response-code';
import { BCMSApiKeySecurity } from '@backend/security';
import { ObjectUtility } from '@becomes/purple-cheetah';
import { useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTError,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  ControllerMethodPreRequestHandler,
  HTTPError,
  HTTPStatus,
  ObjectSchema,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import type {
  BCMSApiKey,
  BCMSRouteProtectionApiConfig,
  BCMSRouteProtectionGQLRequest,
  BCMSRouteProtectionJWTAndBodyCheckConfig,
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSRouteProtectionJWTConfig,
  BCMSRouteProtectionJwtResult,
  BCMSRouteProtectionRestRequest,
  BCMSUserCustomPool,
  BCMSUserPolicy,
} from '../types';

export class BCMSRouteProtection {
  static async routeProtectionCheckPolicy({
    errorHandler,
    policy,
    gql,
    rest,
  }: {
    rest?: BCMSRouteProtectionRestRequest;
    gql?: BCMSRouteProtectionGQLRequest;
    policy: BCMSUserPolicy;
    errorHandler: HTTPError;
  }): Promise<void> {
    function restError(r: { path: string; method: string }) {
      return errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('a007', { resource: `${r.method}: ${r.path}` }),
      );
    }
    if (rest) {
      rest.method = rest.method.toLowerCase();
      const pathParts = rest.path.split('/').slice(1);
      if (pathParts[0] === 'api') {
        if (pathParts[1] === 'media') {
          if (rest.method === 'get' && !policy.media.get) {
            throw restError(rest);
          } else if (rest.method === 'post' && !policy.media.post) {
            throw restError(rest);
          } else if (rest.method === 'put' && !policy.media.put) {
            throw restError(rest);
          } else if (rest.method === 'delete' && !policy.media.delete) {
            throw restError(rest);
          }
        } else if (pathParts[1] === 'entry') {
          const template = await BCMSRepo.template.methods.findByRef(
            rest.params.tid,
          );
          if (template) {
            const tPolicy = policy.templates.find(
              (e) => e._id === template._id,
            );
            if (!tPolicy) {
              throw restError(rest);
            }
            if (rest.method === 'get' && !tPolicy.get) {
              throw restError(rest);
            } else if (rest.method === 'post' && !tPolicy.post) {
              throw restError(rest);
            } else if (rest.method === 'put' && !tPolicy.put) {
              throw restError(rest);
            } else if (rest.method === 'delete' && !tPolicy.delete) {
              throw restError(rest);
            }
          }
        }
      }
    } else if (gql) {
      // TODO
    }
  }

  static async jwt(
    config: BCMSRouteProtectionJWTConfig,
  ): Promise<JWT<BCMSUserCustomPool>> {
    const jwt = useJwt();
    const token = jwt.get<BCMSUserCustomPool>({
      jwtString: config.tokenString,
      roleNames: config.roleNames,
      permissionName: config.permissionName,
    });
    if (token instanceof JWTError) {
      throw config.errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        token.message,
      );
    }
    if (token.payload.rls[0].name !== JWTRoleName.ADMIN) {
      await BCMSRouteProtection.routeProtectionCheckPolicy({
        errorHandler: config.errorHandler,
        policy: token.payload.props.policy,
        gql: config.gql,
        rest: config.rest,
      });
    }
    return token;
  }

  static async jwtApi({
    j,
    a,
  }: {
    j?: BCMSRouteProtectionJWTConfig;
    a?: BCMSRouteProtectionApiConfig;
  }): Promise<{
    token?: JWT<BCMSUserCustomPool>;
    key?: BCMSApiKey;
  }> {
    if (a) {
      try {
        const key = await BCMSApiKeySecurity.verify(
          BCMSApiKeySecurity.httpRequestToApiKeyRequest(a.request),
        );
        return {
          key,
        };
      } catch (err) {
        const error = err as Error;
        throw a.errorHandler.occurred(HTTPStatus.UNAUTHORIZED, error.message);
      }
    } else if (j) {
      return { token: await BCMSRouteProtection.jwt(j) };
    } else {
      throw Error('JWT and Api are NULL.');
    }
  }

  static async jwtBodyCheck<Body = unknown>(
    config: BCMSRouteProtectionJWTAndBodyCheckConfig,
  ): Promise<BCMSRouteProtectionJwtAndBodyCheckResult<Body>> {
    const token = await BCMSRouteProtection.jwt(config);
    const checkBody = ObjectUtility.compareWithSchema(
      config.body,
      config.bodySchema,
      'body',
    );
    if (checkBody instanceof ObjectUtilityError) {
      throw config.errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        checkBody.message,
      );
    }

    return {
      accessToken: token,
      body: config.body as Body,
    };
  }

  static createJwtPreRequestHandler(
    roleNames: JWTRoleName[],
    permissionName: JWTPermissionName,
  ): ControllerMethodPreRequestHandler<BCMSRouteProtectionJwtResult> {
    return async ({ request, errorHandler }) => {
      const accessToken = await BCMSRouteProtection.jwt({
        errorHandler,
        permissionName: permissionName,
        roleNames: roleNames,
        tokenString: request.headers.authorization as string,
        rest: {
          path: request.originalUrl,
          method: request.method,
          params: request.params,
        },
      });

      return {
        accessToken,
      };
    };
  }

  static createJwtApiPreRequestHandler(config: {
    roleNames: JWTRoleName[];
    permissionName: JWTPermissionName;
  }): ControllerMethodPreRequestHandler<{
    token?: JWT<BCMSUserCustomPool>;
    key?: BCMSApiKey;
  }> {
    return async ({ request, errorHandler }) => {
      return await BCMSRouteProtection.jwtApi({
        a: request.query.signature
          ? {
              errorHandler,
              request,
            }
          : undefined,
        j: !request.query.signature
          ? {
              errorHandler,
              permissionName: config.permissionName,
              roleNames: config.roleNames,
              tokenString: request.headers.authorization as string,
              rest: {
                method: request.method,
                params: request.params,
                path: request.originalUrl,
              },
            }
          : undefined,
      });
    };
  }

  static createJwtAndBodyCheckPreRequestHandler<Body>(config: {
    roleNames: JWTRoleName[];
    permissionName: JWTPermissionName;
    bodySchema: ObjectSchema;
  }): ControllerMethodPreRequestHandler<
    BCMSRouteProtectionJwtAndBodyCheckResult<Body>
  > {
    return async ({ request, errorHandler }) => {
      return await BCMSRouteProtection.jwtBodyCheck({
        body: request.body,
        bodySchema: config.bodySchema,
        errorHandler: errorHandler,
        permissionName: config.permissionName,
        roleNames: config.roleNames,
        tokenString: request.headers.authorization as string,
        rest: {
          path: request.originalUrl,
          method: request.method,
          params: request.params,
        },
      });
    };
  }
}
