import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSMediaDuplicateData {
  _id: string;
  duplicateTo: string;
}

export const BCMSMediaDuplicateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  duplicateTo: {
    __type: 'string',
    __required: false,
  },
};
