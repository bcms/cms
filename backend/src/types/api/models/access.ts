import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSUserPolicyCRUD,
  BCMSUserPolicyCRUDFSDBSchema,
} from '../..';

/**
 * Defines what specific Key can do with Template/Templates.
 */
export interface BCMSApiKeyAccess {
  templates: Array<BCMSUserPolicyCRUD & { _id: string; name?: string }>;
  functions: Array<{
    name: string;
  }>;
  plugins?: Array<{ name: string }>;
}
export const BCMSApiKeyAccessFSDBSchema: ObjectSchema = {
  templates: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        ...BCMSUserPolicyCRUDFSDBSchema,
        _id: {
          __type: 'string',
          __required: true,
        },
        name: {
          __type: 'string',
          __required: false,
        },
      },
    },
  },
  functions: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        name: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
  plugins: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: {
        name: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
};
export const BCMSApiKeyAccessMongoDBSchema = new Schema({
  templates: {
    type: [Object],
  },
  functions: {
    type: [{ name: { type: String, required: true } }],
    required: true,
  },
  plugins: {
    type: [{ name: { type: String, required: true } }],
    required: false,
  },
});
