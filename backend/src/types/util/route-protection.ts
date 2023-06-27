import type {
  JWT,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import type { HTTPError, ObjectSchema } from '@becomes/purple-cheetah/types';
import type { Request } from 'express';
import type { BCMSApiKey } from '..';
import type { BCMSUserCustomPool } from '../user';

export interface BCMSRouteProtectionRestRequest {
  path: string;
  method: string;
  params: {
    [name: string]: string;
  };
}
export interface BCMSRouteProtectionGQLRequest {
  collection: string;
  resolver: string;
}
export interface BCMSRouteProtectionJWTConfig {
  rest?: BCMSRouteProtectionRestRequest;
  gql?: BCMSRouteProtectionGQLRequest;
  roleNames: JWTRoleName[];
  permissionName: JWTPermissionName;
  tokenString: string;
  errorHandler: HTTPError;
}
export interface BCMSRouteProtectionApiConfig {
  request: Request;
  errorHandler: HTTPError;
}

export interface BCMSRouteProtectionJwtResult {
  accessToken: JWT<BCMSUserCustomPool>;
}

export interface BCMSRouteProtectionJwtAndBodyCheckResult<Body> {
  accessToken: JWT<BCMSUserCustomPool>;
  body: Body;
}

export interface BCMSRouteProtectionJWTAndBodyCheckConfig
  extends BCMSRouteProtectionJWTConfig {
  bodySchema: ObjectSchema;
  body: unknown;
}

export interface BCMSRouteProtectionJwtApiResult {
  token?: JWT<BCMSUserCustomPool>;
  key?: BCMSApiKey;
}
