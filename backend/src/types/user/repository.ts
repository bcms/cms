import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSUser } from './models';

export interface BCMSUserRepositoryMethods {
  findByEmail(email: string): Promise<BCMSUser | null>;
}

export type BCMSUserRepository =
  | FSDBRepository<BCMSUser, BCMSUserRepositoryMethods>
  | MongoDBCachedRepository<BCMSUser, BCMSUserRepositoryMethods>;
