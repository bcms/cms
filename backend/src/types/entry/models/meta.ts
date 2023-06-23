import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';
import type { BCMSPropParsed, BCMSPropValue } from '../../prop';

export interface BCMSEntryMeta {
  lng: string;
  props: BCMSPropValue[];
}
export const BCMSEntryMetaFSDBSchema: ObjectSchema = {
  lng: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: {
        id: {
          __type: 'string',
          __required: true,
        },
      },
    },
  },
};
export const BCMSEntryMetaMongoDBSchema = new Schema({
  lng: {
    type: String,
    required: true,
  },
  props: {
    type: [Object],
    required: true,
  },
});

export interface BCMSEntryParsedMeta {
  [lng: string]: BCMSPropParsed;
}
