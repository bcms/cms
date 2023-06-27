import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropDataParsed, BCMSPropValue } from './main';

export interface BCMSPropGroupPointerData {
  _id: string;
}

export interface BCMSPropGroupPointerDataParsed {
  [key: string]: BCMSPropDataParsed | BCMSPropDataParsed[];
}

export const BCMSPropGroupPointerDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
};

export interface BCMSPropValueGroupPointerData {
  _id: string;
  items: Array<{
    props: BCMSPropValue[];
  }>;
}
