import type { JWTRoleName } from '@becomes/purple-cheetah-mod-jwt/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSUserCreateBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: JWTRoleName;
}

export const BCMSUserCreateBodySchema: ObjectSchema = {
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
  role: {
    __type: 'string',
    __required: true,
  },
};
