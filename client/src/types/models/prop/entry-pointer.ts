import type { BCMSPropParsed } from './main';
import type { BCMSEntryContentParsedItem } from '../entry';

export interface BCMSPropEntryPointerData {
  templateId: string;
  entryIds: string[];
  displayProp: string;
}

export interface BCMSPropEntryPointerDataParsed {
  _id: string;
  cid: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSPropParsed;
  content: BCMSEntryContentParsedItem[];
}
