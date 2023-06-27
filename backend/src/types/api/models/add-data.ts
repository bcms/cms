import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSApiKeyAccess, BCMSApiKeyAccessFSDBSchema } from './access';

export interface BCMSApiKeyAddData {
  name: string;
  desc: string;
  blocked: boolean;
  access: BCMSApiKeyAccess;
}

export const BCMSApiKeyAddDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  blocked: {
    __type: 'boolean',
    __required: true,
  },
  access: {
    __type: 'object',
    __required: true,
    __child: BCMSApiKeyAccessFSDBSchema,
  },
};
