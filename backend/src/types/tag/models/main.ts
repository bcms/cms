import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSTag extends FSDBEntity {
  /** Unique */
  value: string;
  cid: string;
}

export const BCMSTagFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  value: {
    __type: 'string',
    __required: true,
  },
  cid: {
    __type: 'string',
    __required: true,
  },
};
export const BCMSTagMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  value: {
    type: String,
    required: true,
  },
  cid: {
    type: String,
    required: true,
  },
});
