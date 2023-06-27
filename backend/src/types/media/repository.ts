import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSMedia } from './models';

export interface BCMSMediaRepositoryMethods {
  findAllByIsInRoot(isInRoot: boolean): Promise<BCMSMedia[]>;
  findByNameAndParentId(
    name: string,
    parentId?: string,
  ): Promise<BCMSMedia | null>;
  findAllByParentId(parentId: string): Promise<BCMSMedia[]>;
}

export type BCMSMediaRepository =
  | MongoDBCachedRepository<BCMSMedia, BCMSMediaRepositoryMethods>
  | FSDBRepository<BCMSMedia, BCMSMediaRepositoryMethods>;
