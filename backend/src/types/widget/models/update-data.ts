import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSPropChange,
  BCMSPropChangeGql,
  BCMSPropChangeSchema,
} from '../../prop';

export interface BCMSWidgetUpdateData {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: BCMSPropChange[];
  previewImage?: string;
  previewScript?: string;
  previewStyle?: string;
}
export interface BCMSWidgetUpdateDataGql {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: BCMSPropChangeGql[];
  previewImage?: string;
  previewScript?: string;
  previewStyle?: string;
}
export const BCMSWidgetUpdateDataSchema: ObjectSchema = {
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
  previewImage: {
    __type: 'string',
    __required: false,
  },
  previewScript: {
    __type: 'string',
    __required: false,
  },
  previewStyle: {
    __type: 'string',
    __required: false,
  },
};
