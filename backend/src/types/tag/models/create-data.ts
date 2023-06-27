import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSTagCreateData {
  value: string;
}

export const BCMSTagCreateDataSchema: ObjectSchema = {
  value: {
    __type: 'string',
    __required: true,
  },
};
