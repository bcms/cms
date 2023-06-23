import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSChange, BCMSChangeName } from './models';

export interface BCMSChangeRepositoryMethods {
  updateAndInc(change: BCMSChange): Promise<BCMSChange | null>;
  updateAndIncByName(name: BCMSChangeName): Promise<BCMSChange | null>;
  findByName(name: BCMSChangeName): Promise<BCMSChange | null>;
}

export type BCMSChangeRepository =
  | MongoDBCachedRepository<BCMSChange, BCMSChangeRepositoryMethods>
  | FSDBRepository<BCMSChange, BCMSChangeRepositoryMethods>;
