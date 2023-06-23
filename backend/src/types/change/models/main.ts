import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export type BCMSChangeName =
  | 'entry'
  | 'group'
  | 'color'
  | 'language'
  | 'media'
  | 'status'
  | 'tag'
  | 'templates'
  | 'widget';

export interface BCMSChange extends FSDBEntity {
  name: BCMSChangeName;
  count: number;
}

export const BCMSChangeFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  count: {
    __type: 'number',
    __required: true,
  },
};

export const BCMSChangeMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  name: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});
