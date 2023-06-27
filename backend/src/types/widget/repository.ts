import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSWidget } from './models';

export interface BCMSWidgetRepositoryMethods {
  findByName(name: string): Promise<BCMSWidget | null>;
  findByCid(cid: string): Promise<BCMSWidget | null>;
  findAllByCid(cids: string[]): Promise<BCMSWidget[]>;
  findAllByPropGroupPointer(groupId: string): Promise<BCMSWidget[]>;
  findAllByPropEntryPointer(templateId: string): Promise<BCMSWidget[]>;
  findAllByPropTag(tagId: string): Promise<BCMSWidget[]>;
  findAllByPropMedia(mediaId: string): Promise<BCMSWidget[]>;
  findAllByPropWidget(widgetId: string): Promise<BCMSWidget[]>;
}

export type BCMSWidgetRepository =
  | MongoDBCachedRepository<BCMSWidget, BCMSWidgetRepositoryMethods>
  | FSDBRepository<BCMSWidget, BCMSWidgetRepositoryMethods>;
