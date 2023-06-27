import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSStatus extends FSDBEntity {
  label: string;
  name: string;
  color: string;
}

export const BCMSStatusFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  label: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  color: {
    __type: 'string',
    __required: true,
  },
};

export const BCMSStatusMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: String,
});
