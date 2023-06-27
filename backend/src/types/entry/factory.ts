import type { BCMSTemplate } from '../template';
import type {
  BCMSEntry,
  BCMSEntryContent,
  BCMSEntryLite,
  BCMSEntryMeta,
} from './models';

export interface BCMSEntryFactory {
  create(data: {
    cid?: string;
    templateId?: string;
    userId?: string;
    status?: string;
    meta?: BCMSEntryMeta[];
    content?: BCMSEntryContent[];
  }): BCMSEntry;
  toLite(entry: BCMSEntry, template?: BCMSTemplate): BCMSEntryLite;
}
