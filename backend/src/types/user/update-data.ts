import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSUserPolicyCRUD,
  BCMSUserPolicyCRUDFSDBSchema,
  BCMSUserPolicyTemplate,
  BCMSUserPolicyPlugin,
  BCMSUserPolicyTemplateFSDBSchema,
  BCMSUserPolicyPluginFSDBSchema,
} from './models';

export interface BCMSUserUpdateData {
  _id: string;
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
