import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSUserAddress {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  street?: {
    name: string;
    number: string;
  };
}

export const BCMSUserAddressFSDBSchema: ObjectSchema = {
  country: {
    __type: 'string',
    __required: false,
  },
  city: {
    __type: 'string',
    __required: false,
  },
  state: {
    __type: 'string',
    __required: false,
  },
  zip: {
    __type: 'string',
    __required: false,
  },
  street: {
    __type: 'object',
    __required: false,
    __child: {
      name: {
        __type: 'string',
        __required: true,
      },
      number: {
        __type: 'string',
        __required: true,
      },
    },
  },
};

export const BCMSUserAddressMongoDBSchema = new Schema({
  country: String,
  city: String,
  state: String,
  zip: String,
  street: Object,
});
