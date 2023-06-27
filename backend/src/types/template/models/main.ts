import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import type { BCMSProp, BCMSPropGql } from '../../prop';

export interface BCMSTemplate extends FSDBEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  userId: string;
  singleEntry: boolean;
  props: BCMSProp[];
}

export interface BCMSTemplateGql extends FSDBEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  userId: string;
  singleEntry: boolean;
  props: BCMSPropGql[];
}

export const BCMSTemplateFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  cid: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  singleEntry: {
    __type: 'boolean',
    __required: true,
  },
};

export const BCMSTemplateMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  cid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  desc: String,
  userId: {
    type: String,
  },
  singleEntry: {
    type: Boolean,
    required: true,
  },
  props: {
    type: [Object],
    required: true,
  },
});
