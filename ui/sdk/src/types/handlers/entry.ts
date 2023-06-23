import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSEntry,
  BCMSEntryCreateData,
  BCMSEntryLite,
  BCMSEntryParsed,
  BCMSEntryUpdateData,
} from '../models';

export interface BCMSEntryHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export interface BCMSEntryHandler {
  getAllByTemplateId(data: { templateId: string }): Promise<BCMSEntry[]>;
  getAllLite(data: { templateId: string }): Promise<BCMSEntryLite[]>;
  getAllParsed(data: { templateId: string }): Promise<BCMSEntryParsed[]>;
  getManyLite(data: {
    templateId: string;
    entryIds: string[];
    skipCache?: boolean;
  }): Promise<BCMSEntryLite[]>;
  getLite(data: {
    templateId: string;
    entryId: string;
    skipCache?: boolean;
  }): Promise<BCMSEntryLite>;
  get(data: {
    templateId: string;
    entryId: string;
    skipCache?: boolean;
  }): Promise<BCMSEntry>;
  getOneParsed(data: {
    templateId: string;
    entryId: string;
    skipCache?: boolean;
    maxDepth?: number;
  }): Promise<BCMSEntryParsed>;
  whereIsItUsed(data: {
    templateId: string;
    entryId: string;
  }): Promise<Array<{ eid: string; tid: string }>>;
  create(data: BCMSEntryCreateData): Promise<BCMSEntry>;
  update(data: BCMSEntryUpdateData): Promise<BCMSEntry>;
  deleteById(data: { templateId: string; entryId: string }): Promise<string>;
  count(data: { templateId: string }): Promise<number>;
  countByUser(): Promise<number>;
}
