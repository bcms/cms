import type { BCMSEntity } from './entity';

export interface BCMSTemplateOrganizer extends BCMSEntity {
  parentId?: string;
  label: string;
  name: string;
  templateIds: string[];
}

export interface BCMSTemplateOrganizerCreateData {
  label: string;
  templateIds: string[];
  parentId?: string;
}

export interface BCMSTemplateOrganizerUpdateData {
  _id: string;
  parentId?: string;
  label?: string;
  templateIds?: string[];
}
