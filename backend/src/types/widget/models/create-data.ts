import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSWidgetCreateData {
  label: string;
  desc: string;
  previewImage: string;
  previewScript: string;
  previewStyle: string;
}

export const BCMSWidgetCreateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  previewImage: {
    __type: 'string',
    __required: true,
  },
  previewScript: {
    __type: 'string',
    __required: true,
  },
  previewStyle: {
    __type: 'string',
    __required: true,
  },
};
