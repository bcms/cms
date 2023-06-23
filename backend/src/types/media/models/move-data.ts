import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSMediaMoveData {
  _id: string;
  moveTo: string;
}

export const BCMSMediaMoveDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  moveTo: {
    __type: 'string',
    __required: false,
  },
};
