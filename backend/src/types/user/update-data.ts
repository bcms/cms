import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSUserPolicyCRUD,
  BCMSUserPolicyCRUDFSDBSchema,
  BCMSUserPolicyTemplate,
  BCMSUserPolicyPlugin,
  BCMSUserPolicyTemplateFSDBSchema,
  BCMSUserPolicyPluginFSDBSchema,
} from './models';
import type { JWTRoleName } from '@becomes/purple-cheetah-mod-jwt/types';

export interface BCMSUserUpdateData {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: JWTRoleName;
  customPool?: {
    policy?: {
      media?: BCMSUserPolicyCRUD;
      templates?: BCMSUserPolicyTemplate[];
      plugins?: BCMSUserPolicyPlugin[];
    };
  };
}

export const BCMSUserUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  firstName: {
    __type: 'string',
    __required: false,
  },
  lastName: {
    __type: 'string',
    __required: false,
  },
  email: {
    __type: 'string',
    __required: false,
  },
  password: {
    __type: 'string',
    __required: false,
  },
  role: {
    __type: 'string',
    __required: false,
  },
  customPool: {
    __type: 'object',
    __required: false,
    __child: {
      policy: {
        __type: 'object',
        __required: false,
        __child: {
          media: {
            __type: 'object',
            __required: false,
            __child: BCMSUserPolicyCRUDFSDBSchema,
          },
          templates: {
            __type: 'array',
            __required: false,
            __child: {
              __type: 'object',
              __content: BCMSUserPolicyTemplateFSDBSchema,
            },
          },
          plugins: {
            __type: 'array',
            __required: false,
            __child: {
              __type: 'object',
              __content: BCMSUserPolicyPluginFSDBSchema,
            },
          },
        },
      },
    },
  },
};
