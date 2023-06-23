import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSTag } from './models';

export interface BCMSTagRepositoryMethods {
  findByValue(value: string): Promise<BCMSTag | null>;
  findByCid(cid: string): Promise<BCMSTag | null>;
  findAllByCid(cids: string[]): Promise<BCMSTag[]>;
}

export type BCMSTagRepository =
  | MongoDBCachedRepository<BCMSTag, BCMSTagRepositoryMethods>
  | FSDBRepository<BCMSTag, BCMSTagRepositoryMethods>;
