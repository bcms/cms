import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSLanguage } from './models';

export interface BCMSLanguageRepositoryMethods {
  findByCode(code: string): Promise<BCMSLanguage | null>;
  findByDefault(): Promise<BCMSLanguage | null>;
}

export type BCMSLanguageRepository =
  | MongoDBCachedRepository<BCMSLanguage, BCMSLanguageRepositoryMethods>
  | FSDBRepository<BCMSLanguage, BCMSLanguageRepositoryMethods>;
