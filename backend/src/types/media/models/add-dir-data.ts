import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSMediaAddDirData {
  name: string;
  parentId?: string;
}

export const BCMSMediaAddDirDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: false,
  },
};
