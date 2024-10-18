import type { UserJwt } from '@bcms/selfhosted-backend/user/models/main';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import type { ControllerMethodPreRequestHandler } from '@bcms/selfhosted-backend/_server';

import { RPBodyCheck } from '@bcms/selfhosted-backend/security/route-protection/body-check';
import { RPJwt } from '@bcms/selfhosted-backend/security/route-protection/jwt';
import { RPApiKey } from '@bcms/selfhosted-backend/security/route-protection/api-key';
import type { UserRoleName } from '@bcms/selfhosted-backend/user/models/role';

export interface RPBodyCheckResult<Body> {
    body: Body;
}

export interface RPJwtCheckResult {
    token: UserJwt;
}

export interface RPJwtBodyCheckResult<Body> {
    token: UserJwt;
    body: Body;
}

export interface RPApiKeyCheckResult {
    apiKey: ApiKey;
}

export interface RPApiKeyBodyCheckResult<Body> {
    apiKey: ApiKey;
    body: Body;
}

export interface RPApiKeyJwtCheckResult {
    apiKey?: ApiKey;
    token?: UserJwt;
}

export interface RPApiKeyJwtBodyCheckResult<Body> {
    apiKey?: ApiKey;
    token?: UserJwt;
    body: Body;
}

/**
 * RP - Route Protection
 */
export class RP {
    private static body = new RPBodyCheck();
    private static jwt = new RPJwt();
    private static apiKey = new RPApiKey();

    static createBodyCheck<Body = unknown>(
        schema: ObjectSchema,
    ): ControllerMethodPreRequestHandler<RPBodyCheckResult<Body>> {
        return async (data) => {
            return {
                body: this.body.verify(
                    data.request.body,
                    schema,
                    data.errorHandler,
                ),
            };
        };
    }

    static createJwtCheck(
        roles?: UserRoleName[],
    ): ControllerMethodPreRequestHandler<RPJwtCheckResult> {
        return async (data) => {
            return {
                token: this.jwt.verify(
                    data.errorHandler,
                    data.request.headers.authorization ||
                        (data.request.query as any).at,
                    roles,
                ),
            };
        };
    }

    static createJwtBodyCheck<Body = unknown>(
        schema: ObjectSchema,
        roles?: UserRoleName[],
    ): ControllerMethodPreRequestHandler<RPJwtBodyCheckResult<Body>> {
        const bodyCheck = this.createBodyCheck<Body>(schema);
        const jwtCheck = this.createJwtCheck(roles);
        return async (data) => {
            return {
                ...(await bodyCheck(data)),
                ...(await jwtCheck(data)),
            };
        };
    }

    static createApiKeyCheck(): ControllerMethodPreRequestHandler<RPApiKeyCheckResult> {
        return async (data) => {
            const params = data.request.params as {
                instanceId?: string;
                templateId?: string;
                entryId?: string;
                functionId?: string;
            };
            const query = data.request.query as {
                apiKey?: string;
            };
            return {
                apiKey: await this.apiKey.verify(
                    data.errorHandler,
                    data.request.method,
                    data.request.headers.authorization || query.apiKey,
                    params.instanceId,
                ),
            };
        };
    }

    static createApiKeyBodyCheck<Body = unknown>(
        schema: ObjectSchema,
    ): ControllerMethodPreRequestHandler<RPApiKeyBodyCheckResult<Body>> {
        const bodyCheck = this.createBodyCheck<Body>(schema);
        const apiKeyCheck = this.createApiKeyCheck();
        return async (data) => {
            return {
                ...(await bodyCheck(data)),
                ...(await apiKeyCheck(data)),
            };
        };
    }

    static createApiKeyJwtCheck(
        roles?: UserRoleName[],
    ): ControllerMethodPreRequestHandler<RPApiKeyJwtCheckResult> {
        const apiKeyCheck = this.createApiKeyCheck();
        const jwtCheck = this.createJwtCheck(roles);
        return async (data) => {
            const query = data.request.query as {
                apiKey: string;
            };
            if (
                (data.request.headers.authorization &&
                    data.request.headers.authorization.startsWith('ApiKey')) ||
                query.apiKey
            ) {
                return apiKeyCheck(data);
            } else {
                return jwtCheck(data);
            }
        };
    }

    static createApiKeyJwtBodyCheck<Body = unknown>(
        schema: ObjectSchema,
        roles?: UserRoleName[],
    ): ControllerMethodPreRequestHandler<RPApiKeyJwtBodyCheckResult<Body>> {
        const apiKeyCheck = this.createApiKeyBodyCheck<Body>(schema);
        const jwtCheck = this.createJwtBodyCheck<Body>(schema, roles);
        return async (data) => {
            const query = data.request.query as {
                apiKey: string;
            };
            if (
                (data.request.headers.authorization &&
                    data.request.headers.authorization.startsWith('ApiKey')) ||
                query.apiKey
            ) {
                return apiKeyCheck(data);
            } else {
                return jwtCheck(data);
            }
        };
    }
}
