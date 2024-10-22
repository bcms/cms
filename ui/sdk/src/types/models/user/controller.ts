import type { BCMSJwtRoleName } from '@becomes/cms-sdk/types';

export interface BCMSUserCreateBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: BCMSJwtRoleName;
}
