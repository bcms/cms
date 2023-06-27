import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSApiKey,
  BCMSApiKeyFSDBSchema,
  BCMSApiKeyMongoDBSchema,
} from '../types';

export function createBcmsApiKeyRepository(): Module {
  return {
    name: 'Create api key repository',
    initialize({ next }) {
      const name = 'Api key repository';
      const collection = `${BCMSConfig.database.prefix}_api_keys`;

      BCMSRepo.apiKey = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSApiKey, void>({
            name,
            collection,
            schema: BCMSApiKeyFSDBSchema,
          })
        : createMongoDBCachedRepository<BCMSApiKey, void, void>({
            name,
            collection,
            schema: BCMSApiKeyMongoDBSchema,
          });

      next();
    },
  };
}
