import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSMediaUpdateData {
  _id: string;
  altText?: string;
  caption?: string;
  name?: string;
  /** ID of the parent dir or `root`. */
}

export const BCMSMediaUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: false,
  },
  altText: {
    __type: 'string',
    __required: false,
  },
  caption: {
    __type: 'string',
    __required: false,
  },
};
