import type { BCMSJwtPermission } from './permission';

// eslint-disable-next-line no-shadow
export enum BCMSJwtRoleName {
  SUDO = 'SUDO',
  DEV = 'DEV',

  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  SERVICE = 'SERVICE',

  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT',
  USER = 'USER',
  GUEST = 'GUEST',
}

export interface BCMSJwtRole {
  name: BCMSJwtRoleName;
  permissions: BCMSJwtPermission[];
}
