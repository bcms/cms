import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSTagUpdateData {
  _id: string;
  value: string;
}
export const BCMSTagUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
};
