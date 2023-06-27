import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSGroupAddData {
  label: string;
  desc: string;
}

export const BCMSGroupAddDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
};
