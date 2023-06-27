import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSPropDataParsed, BCMSPropSchema, BCMSPropValue } from './main';

export interface BCMSPropWidgetData {
  _id: string;
}

export interface BCMSPropWidgetDataParsed {
  [key: string]: BCMSPropDataParsed;
}

export const BCMSPropWidgetDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSPropSchema,
    },
  },
};

export interface BCMSPropValueWidgetData {
  _id: string;
  props: BCMSPropValue[];
}
