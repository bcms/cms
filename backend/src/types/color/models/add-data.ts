import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSColorCreateData {
  label: string;
  value: string;
  global: boolean;
}

export const BCMSColorCreateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
  global: {
    __type: 'boolean',
    __required: true,
  },
};
