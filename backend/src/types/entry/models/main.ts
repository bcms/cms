import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import {
  BCMSEntryContent,
  BCMSEntryContentFSDBSchema,
  BCMSEntryContentMongoDBSchema,
} from './content';
import {
  BCMSEntryMeta,
  BCMSEntryMetaFSDBSchema,
  BCMSEntryMetaMongoDBSchema,
} from './meta';

export interface BCMSEntry extends FSDBEntity {
  cid: string;
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export const BCMSEntryFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  cid: {
    __type: 'string',
    __required: true,
  },
  templateId: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: false,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryMetaFSDBSchema,
    },
  },
  content: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryContentFSDBSchema,
    },
  },
};

export const BCMSEntryMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  cid: {
    type: String,
    required: true,
  },
  templateId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: String,
  meta: {
    type: [BCMSEntryMetaMongoDBSchema],
    required: true,
  },
  content: {
    type: [BCMSEntryContentMongoDBSchema],
    required: true,
  },
});
