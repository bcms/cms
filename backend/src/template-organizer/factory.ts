import { Types } from 'mongoose';
import type { BCMSTemplateOrganizerFactory } from '../types';

export function createBcmsTemplateOrganizerFactory(): BCMSTemplateOrganizerFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        templateIds: data.templateIds ? data.templateIds : [],
        parentId: data.parentId,
      };
    },
  };
}
