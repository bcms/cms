import type { FSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/types';
import type { MongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache/types';
import type { BCMSApiKey } from './models';

export type BCMSApiKeyMongoDBRepository = MongoDBCachedRepository<
  BCMSApiKey,
  void
>;

export type BCMSApiKeyFSDBRepository = FSDBRepository<BCMSApiKey, void>;

export type BCMSApiKeyRepository =
  | BCMSApiKeyMongoDBRepository
  | BCMSApiKeyFSDBRepository;
