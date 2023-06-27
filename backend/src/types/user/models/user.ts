import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import {
  JWT,
  JWTRole,
  JWTRoleSchema,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSUserCustomPool,
  BCMSUserCustomPoolFSDBSchema,
  BCMSUserCustomPoolMongoDBSchema,
} from './custom-pool';

export interface BCMSUser extends FSDBEntity {
  username: string;
  email: string;
  password: string;
  roles: JWTRole[];
  customPool: BCMSUserCustomPool;
}

export interface BCMSProtectedUser extends FSDBEntity {
  username: string;
  email: string;
  roles: JWTRole[];
  customPool: BCMSUserCustomPool;
}

export interface JWTProtectionType {
  accessToken: JWT<BCMSUserCustomPool>;
}

export const BCMSUserMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  roles: { type: [Object], required: true },
  customPool: {
    type: BCMSUserCustomPoolMongoDBSchema,
    required: true,
  },
});

export const BCMSUserFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  username: {
    __type: 'string',
    __required: true,
  },
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  roles: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: JWTRoleSchema,
    },
  },
  customPool: {
    __type: 'object',
    __required: true,
    __child: BCMSUserCustomPoolFSDBSchema,
  },
};
