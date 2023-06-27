import {
  FSDBEntity,
  FSDBEntitySchema,
} from '@becomes/purple-cheetah-mod-fsdb/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSEntryMeta, BCMSEntryMetaFSDBSchema } from './meta';

export interface BCMSEntryLite extends FSDBEntity {
  cid: string;
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
}

export const BCMSEntryLiteSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  cid: {
    __type: 'string',
    __required: true,
  },
  templateId: {
    __type: 'string',
    __required: true,
  },
  userId: {
    __type: 'string',
    __required: true,
  },
  status: {
    __type: 'string',
    __required: false,
  },
  meta: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryMetaFSDBSchema,
    },
  },
};
