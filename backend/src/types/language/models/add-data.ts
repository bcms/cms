import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSLanguageAddData {
  code: string;
  name: string;
  nativeName: string;
}

export const BCMSLanguageAddDataSchema: ObjectSchema = {
  code: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  nativeName: {
    __type: 'string',
    __required: true,
  },
};
