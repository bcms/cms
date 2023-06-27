import type { BCMSJwtPayload } from './payload';
import type { BCMSJwtHeader } from './header';

export interface BCMSJwt {
  header: BCMSJwtHeader;
  payload: BCMSJwtPayload;
  signature: string;
}
