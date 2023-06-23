import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { BCMSEntryContent, BCMSEntryContentFSDBSchema } from './content';
import { BCMSEntryMeta, BCMSEntryMetaFSDBSchema } from './meta';

export interface BCMSEntryUpdateData {
  _id: string;
  templateId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export const BCMSEntryUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  templateId: {
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
  content: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: BCMSEntryContentFSDBSchema,
    },
  },
};
