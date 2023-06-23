import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSApiKeyAccess,
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyAccessMongoDBSchema,
} from './access';

export interface BCMSApiKey extends FSDBEntity {
  userId: string;
  name: string;
  desc: string;
  blocked: boolean;
  secret: string;
  access: BCMSApiKeyAccess;
}

export const BCMSApiKeyFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  blocked: {
    __type: 'boolean',
    __required: true,
  },
  secret: {
    __type: 'string',
    __required: true,
  },
  access: {
    __type: 'object',
    __required: true,
    __child: BCMSApiKeyAccessFSDBSchema,
  },
};

export const BCMSApiKeyMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  desc: String,
  blocked: {
    type: Boolean,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  access: {
    type: BCMSApiKeyAccessMongoDBSchema,
    required: true,
  },
});
