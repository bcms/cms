import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSIdCounter extends FSDBEntity {
  name: string;
  forId: string;
  count: number;
}

export const BCMSIdCounterFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  forId: {
    __type: 'string',
    __required: true,
  },
  count: {
    __type: 'number',
    __required: true,
  },
};

export const BCMSIdCounterMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  name: {
    type: String,
    required: true,
  },
  forId: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});
