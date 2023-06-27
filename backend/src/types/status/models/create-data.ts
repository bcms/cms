import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSStatusCreateData {
  label: string;
  color?: string;
}

export const BCMSStatusCreateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  color: {
    __type: 'string',
    __required: false,
  },
};
