import type { BCMSEntryContentParsed } from '@backend/types';
import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { BCMSEntryParsedMeta } from './meta';

export interface BCMSEntryParsed extends FSDBEntity {
  templateId: string;
  templateName: string;
  userId: string;
  status: string;
  meta: BCMSEntryParsedMeta;
  content: BCMSEntryContentParsed;
}
