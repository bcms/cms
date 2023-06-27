import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSEntry } from './models';

export interface BCMSEntryRepositoryMethods {
  findByTemplateIdAndRef(
    templateId: string,
    ref: string,
  ): Promise<BCMSEntry | null>;
  findByTemplateIdAndCid(
    templateId: string,
    entryCid: string,
  ): Promise<BCMSEntry | null>;
  findByTemplateIdAndId(
    templateId: string,
    entryId: string,
  ): Promise<BCMSEntry | null>;
  findAllByStatus(status: string): Promise<BCMSEntry[]>;
  findAllByTemplateId(templateId: string): Promise<BCMSEntry[]>;
  findAllByWidgetId(widgetId: string): Promise<BCMSEntry[]>;
  clearAllStatuses(currentStatus: string): Promise<void>;
  deleteAllByTemplateId(templateId: string): Promise<void>;
  countByTemplateId(templateId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
  add(entry: BCMSEntry): Promise<BCMSEntry>;
}

export type BCMSEntryRepository =
  | MongoDBCachedRepository<BCMSEntry, BCMSEntryRepositoryMethods>
  | FSDBRepository<BCMSEntry, BCMSEntryRepositoryMethods>;
