import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSApiKeyAccess, BCMSApiKeyAccessFSDBSchema } from './access';

export interface BCMSApiKeyUpdateData {
  _id: string;
  name?: string;
  desc?: string;
  blocked?: boolean;
  access?: BCMSApiKeyAccess;
}

export const BCMSApiKeyUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: false,
  },
  desc: {
    __type: 'string',
    __required: false,
  },
  blocked: {
    __type: 'boolean',
    __required: false,
  },
  access: {
    __type: 'object',
    __required: false,
    __child: BCMSApiKeyAccessFSDBSchema,
  },
};
