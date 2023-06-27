import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSLanguage extends FSDBEntity {
  userId: string;
  code: string;
  name: string;
  nativeName: string;
  def: boolean;
}

export const BCMSLanguageFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  code: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  nativeName: {
    __type: 'string',
    __required: true,
  },
  def: {
    __type: 'boolean',
    __required: true,
  },
};

export const BCMSLanguageMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  userId: {
    type: String,
    required: false,
  },
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nativeName: {
    type: String,
    required: true,
  },
  def: {
    type: Boolean,
    required: true,
  },
});
