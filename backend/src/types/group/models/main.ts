import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import type { BCMSProp, BCMSPropGql } from '../../prop';

export interface BCMSGroup extends FSDBEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  props: BCMSProp[];
}

export interface BCMSGroupGql extends FSDBEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  props: BCMSPropGql[];
}

export const BCMSGroupFSDBSchema: ObjectSchema = {
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
};

export const BCMSGroupMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  cid: {
    type: String,
    required: true,
  },
  name: String,
  label: String,
  desc: String,
  props: [Object],
});
