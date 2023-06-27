import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSTemplateOrganizerUpdateData {
  _id: string;
  parentId?: string;
  label?: string;
  templateIds?: string[];
}

export const BCMSTemplateOrganizerUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: false,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  templateIds: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'string',
    },
  },
};
