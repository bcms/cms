import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSLanguageUpdateData {
  _id: string;
  def?: boolean;
}

export const BCMSLanguageUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: false,
  },
  def: {
    __type: 'boolean',
    __required: false,
  },
};
