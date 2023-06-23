import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSPropChange,
  BCMSPropChangeSchema,
  BCMSPropChangeGql,
} from '../../prop';

export interface BCMSGroupUpdateData {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: BCMSPropChange[];
}
export const BCMSGroupUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  desc: {
    __type: 'string',
    __required: false,
  },
  propChanges: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: BCMSPropChangeSchema,
    },
  },
};

export interface BCMSGroupUpdateDataGql {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: BCMSPropChangeGql[];
}
