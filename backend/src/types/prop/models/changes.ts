import type {
  BCMSPropColorPickerData,
  BCMSPropDataInputGql,
} from '@backend/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSPropColorPickerDataSchema } from './color-picker';
import type { BCMSPropEntryPointerData } from './entry-pointer';
import type { BCMSPropData, BCMSPropType } from './main';

export interface BCMSPropChangeAdd {
  label: string;
  type: BCMSPropType;
  required: boolean;
  array: boolean;
  defaultData?: BCMSPropData;
}
export interface BCMSPropChangeAddGql {
  label: string;
  type: BCMSPropType;
  required: boolean;
  array: boolean;
  defaultData?: BCMSPropDataInputGql;
}

export interface BCMSPropChangeUpdate {
  /** ID of the property which should be updated. */
  id: string;
  label: string;
  move: number;
  required: boolean;
  array?: boolean;
  enumItems?: string[];
  colorData?: BCMSPropColorPickerData;
  entryPointer?: BCMSPropEntryPointerData[];
}
export interface BCMSPropChangeTransform {
  /** ID on property which will be transformed. */
  from: string;
  /** To which property type */
  to: BCMSPropType;
}
export interface BCMSPropChange {
  add?: BCMSPropChangeAdd;
  /** ID of the property which will be removed. */
  remove?: string;
  update?: BCMSPropChangeUpdate;
  transform?: BCMSPropChangeTransform;
}

export const BCMSPropChangeSchema: ObjectSchema = {
  add: {
    __type: 'object',
    __required: false,
    __child: {
      label: {
        __type: 'string',
        __required: true,
      },
      type: {
        __type: 'string',
        __required: true,
      },
      array: {
        __type: 'boolean',
        __required: true,
      },
      required: {
        __type: 'boolean',
        __required: true,
      },
    },
  },
  remove: {
    __type: 'string',
    __required: false,
  },
  update: {
    __type: 'object',
    __required: false,
    __child: {
      id: {
        __type: 'string',
        __required: true,
      },
      label: {
        __type: 'string',
        __required: true,
      },
      move: {
        __type: 'number',
        __required: true,
      },
      required: {
        __type: 'boolean',
        __required: true,
      },
      enumItems: {
        __type: 'array',
        __required: false,
        __child: {
          __type: 'string',
        },
      },
      colorData: {
        __type: 'object',
        __required: false,
        __child: BCMSPropColorPickerDataSchema,
      },
    },
  },
};

export interface BCMSPropChangeGql {
  add?: BCMSPropChangeAddGql;
  /** ID of the property which will be removed. */
  remove?: string;
  update?: BCMSPropChangeUpdate;
  transform?: BCMSPropChangeTransform;
}
