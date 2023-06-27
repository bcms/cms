import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSTemplateCreateData {
  label: string;
  desc: string;
  singleEntry: boolean;
}

export const BCMSTemplateCreateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  singleEntry: {
    __type: 'boolean',
    __required: true,
  },
};
