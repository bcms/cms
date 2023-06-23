import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSColor } from './models';

export interface BCMSColorRepositoryMethods {
  findByName(name: string): Promise<BCMSColor | null>;
  findByCid(cid: string): Promise<BCMSColor | null>;
  findAllByCid(cids: string[]): Promise<BCMSColor[]>;
}

export type BCMSColorRepository =
  | MongoDBCachedRepository<BCMSColor, BCMSColorRepositoryMethods>
  | FSDBRepository<BCMSColor, BCMSColorRepositoryMethods>;
