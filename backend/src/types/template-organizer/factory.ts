import type { BCMSTemplateOrganizer } from './models';

export interface BCMSTemplateOrganizerFactory {
  create(data: {
    parentId?: string;
    label?: string;
    name?: string;
    templateIds?: string[];
  }): BCMSTemplateOrganizer;
}
