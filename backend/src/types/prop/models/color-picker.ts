import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropColorPickerData {
  allowCustom: boolean;
  allowGlobal: boolean;
  selected: string[];
}

export type BCMSPropColorPickerDataParsed = string[] | string;

export const BCMSPropColorPickerDataSchema: ObjectSchema = {
  allowCustom: {
    __type: 'boolean',
    __required: true,
  },
  allowGlobal: {
    __type: 'boolean',
    __required: true,
  },
  selected: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};

export type BCMSPropValueColorPickerData = string[];
