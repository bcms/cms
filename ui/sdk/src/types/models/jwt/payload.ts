import type { BCMSJwtRole } from './role';
import type { BCMSUserCustomPool } from '../user';

export interface BCMSJwtPayload {
  jti: string;
  iss: string;
  iat: number;
  exp: number;
  userId: string;
  roles: BCMSJwtRole[];
  customPool: BCMSUserCustomPool;
}
