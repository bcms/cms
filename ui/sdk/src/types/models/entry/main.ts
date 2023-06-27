import type { BCMSEntity } from '../entity';
import type { BCMSEntryContent } from './content';
import type { BCMSEntryMeta, BCMSEntryParsedMeta } from './meta';

export interface BCMSEntry extends BCMSEntity {
  cid: string;
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export interface BCMSEntryParsed extends BCMSEntity {
  templateId: string;
  userId: string;
  status: string;
  meta: BCMSEntryParsedMeta;
}

export interface BCMSEntryLite extends BCMSEntity {
  cid: string;
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
}

export interface BCMSEntryCreateData {
  templateId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export interface BCMSEntryUpdateData {
  _id: string;
  templateId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}
