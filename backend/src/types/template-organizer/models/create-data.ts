import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSTemplateOrganizerCreateData {
  label: string;
  templateIds: string[];
  parentId?: string;
}

export const BCMSTemplateOrganizerCreateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: false,
  },
  templateIds: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'string',
    },
  },
};
