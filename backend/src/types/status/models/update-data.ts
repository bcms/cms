import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSStatusUpdateData {
  _id: string;
  label?: string;
  color?: string;
}

export const BCMSStatusUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  color: {
    __type: 'string',
    __required: false,
  },
};
