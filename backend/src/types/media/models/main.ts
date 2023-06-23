import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import { MongoDBEntitySchemaString } from '@becomes/purple-cheetah-mod-mongodb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

// eslint-disable-next-line no-shadow
export enum BCMSMediaType {
  DIR = 'DIR',
  IMG = 'IMG',
  VID = 'VID',
  TXT = 'TXT',
  GIF = 'GIF',
  OTH = 'OTH',
  PDF = 'PDF',
  JS = 'JS',
  HTML = 'HTML',
  CSS = 'CSS',
  JAVA = 'JAVA',
}

export interface BCMSMedia extends FSDBEntity {
  userId: string;
  type: BCMSMediaType;
  mimetype: string;
  size: number;
  name: string;
  isInRoot: boolean;
  hasChildren: boolean;
  parentId: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
}

export const BCMSMediaFSDBSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  userId: {
    __type: 'string',
    __required: true,
  },
  mimetype: {
    __type: 'string',
    __required: true,
  },
  size: {
    __type: 'number',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  isInRoot: {
    __type: 'boolean',
    __required: true,
  },
  hasChildren: {
    __type: 'boolean',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: true,
  },
  altText: {
    __type: 'string',
    __required: true,
  },
  caption: {
    __type: 'string',
    __required: true,
  },
  width: {
    __type: 'number',
    __required: true,
  },
  height: {
    __type: 'number',
    __required: true,
  },
};

export const BCMSMediaMongoDBSchema = new Schema({
  ...MongoDBEntitySchemaString,
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isInRoot: {
    type: Boolean,
    required: true,
  },
  hasChildren: {
    type: Boolean,
    required: true,
  },
  altText: String,
  caption: String,
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  parentId: String,
});
