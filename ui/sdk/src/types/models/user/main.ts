import type { BCMSUserCustomPool } from './custom-pool';
import type { BCMSJwtRole } from '../jwt';
import type { BCMSEntity } from '../entity';

export interface BCMSUser extends BCMSEntity {
  username: string;
  email: string;
  roles: BCMSJwtRole[];
  customPool: BCMSUserCustomPool;
}
