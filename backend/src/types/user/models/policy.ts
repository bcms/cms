import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { SchemaDefinitionProperty } from 'mongoose';

interface MongoSchema {
  [name: string]: SchemaDefinitionProperty;
}

export interface BCMSUserPolicyCRUD {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}
export const BCMSUserPolicyCRUDFSDBSchema: ObjectSchema = {
  get: {
    __type: 'boolean',
    __required: true,
  },
  post: {
    __type: 'boolean',
    __required: true,
  },
  put: {
    __type: 'boolean',
    __required: true,
  },
  delete: {
    __type: 'boolean',
    __required: true,
  },
};
export const BCMSUserPolicyCRUDMongoDBSchema: MongoSchema = {
  get: {
    type: Boolean,
    required: true,
  },
  post: {
    type: Boolean,
    required: true,
  },
  put: {
    type: Boolean,
    required: true,
  },
  delete: {
    type: Boolean,
    required: true,
  },
};

export interface BCMSUserPolicyTemplate extends BCMSUserPolicyCRUD {
  _id: string;
}
export const BCMSUserPolicyTemplateFSDBSchema: ObjectSchema = {
  ...BCMSUserPolicyCRUDFSDBSchema,
  _id: {
    __type: 'string',
    __required: true,
  },
};
export const BCMSUserPolicyTemplateMongoDBSchema: MongoSchema = {
  ...BCMSUserPolicyCRUDMongoDBSchema,
  _id: {
    type: String,
    required: true,
  },
};

export interface BCMSUserPolicyPluginOption {
  name: string;
  value: string[];
}
export const BCMSUserPolicyPluginOptionFSDBSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};
export const BCMSUserPolicyPluginOptionMongoDBSchema: MongoSchema = {
  name: {
    type: String,
    required: true,
  },
  value: {
    type: [String],
    required: true,
  },
};
export interface BCMSUserPolicyPlugin {
  name: string;
  allowed: boolean;
  fullAccess: boolean;
  options: BCMSUserPolicyPluginOption[];
}
export const BCMSUserPolicyPluginFSDBSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  allowed: {
    __type: 'boolean',
    __required: true,
  },
  fullAccess: {
    __type: 'boolean',
    __required: true,
  },
  options: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSUserPolicyPluginOptionFSDBSchema,
    },
  },
};
export const BCMSUserPolicyPluginMongoDBSchema: MongoSchema = {
  name: {
    type: String,
    required: true,
  },
  allowed: {
    type: Boolean,
    required: true,
  },
  fullAccess: {
    type: Boolean,
    required: true,
  },
  options: {
    type: [BCMSUserPolicyPluginOptionMongoDBSchema],
    required: true,
  },
};

export interface BCMSUserPolicy {
  media: BCMSUserPolicyCRUD;
  templates: BCMSUserPolicyTemplate[];
  plugins?: BCMSUserPolicyPlugin[];
}
export const BCMSUserPolicyFSDBSchema: ObjectSchema = {
  media: {
    __type: 'object',
    __required: true,
    __child: BCMSUserPolicyCRUDFSDBSchema,
  },
  templates: {
    __type: 'array',
    __required: true,
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
};
export const BCMSUserPolicyMongoDBSchema: MongoSchema = {
  media: {
    type: BCMSUserPolicyCRUDMongoDBSchema,
    required: true,
  },
  templates: {
    type: [BCMSUserPolicyTemplateMongoDBSchema],
    required: true,
  },
  plugins: [BCMSUserPolicyPluginMongoDBSchema],
};
