import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSColorUpdateData {
  _id: string;
  label?: string;
  value?: string;
}

export const BCMSColorUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  value: {
    __type: 'string',
    __required: false,
  },
};
