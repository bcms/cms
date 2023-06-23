import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSStatus } from './models';

export interface BCMSStatusRepositoryMethods {
  findByName(name: string): Promise<BCMSStatus | null>;
}

export type BCMSStatusRepository =
  | MongoDBCachedRepository<BCMSStatus, BCMSStatusRepositoryMethods>
  | FSDBRepository<BCMSStatus, BCMSStatusRepositoryMethods>;
