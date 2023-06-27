import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { Schema } from 'mongoose';

export interface BCMSUserPersonal {
  firstName: string;
  lastName: string;
  avatarUri: string;
}

export const BCMSUserPersonalFSDBSchema: ObjectSchema = {
  firstName: {
    __type: 'string',
    __required: true,
  },
  lastName: {
    __type: 'string',
    __required: true,
  },
  avatarUri: {
    __type: 'string',
    __required: true,
  },
};

export const BCMSUserPersonalMongoDBSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  avatarUri: String,
});
