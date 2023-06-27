import type { BCMSUserCustomPool } from '@backend/types';
import { useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

let jwt: JWTManager;

export function securityVerifyJWT({
  token,
  errorHandler,
  roles,
  permission,
}: {
  token: string;
  errorHandler: HTTPError;
  roles: JWTRoleName[];
  permission: JWTPermissionName;
}): JWT<BCMSUserCustomPool> {
  if (!jwt) {
    jwt = useJwt();
  }
  const accessToken = jwt.get<BCMSUserCustomPool>({
    jwtString: token,
    permissionName: permission,
    roleNames: roles,
  });
  if (accessToken instanceof JWTError) {
    throw errorHandler.occurred(HTTPStatus.UNAUTHORIZED, accessToken.message);
  }
  return accessToken;
}
