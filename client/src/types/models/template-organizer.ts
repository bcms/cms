import type { BCMSEntity } from './_entity';

export interface BCMSTemplateOrganizer extends BCMSEntity {
  parentId?: string;
  label: string;
  name: string;
  templateIds: string[];
}
