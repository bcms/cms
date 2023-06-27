import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSUser,
  BCMSUserFSDBSchema,
  BCMSUserMongoDBSchema,
  BCMSUserRepositoryMethods,
} from '../types';

export function createBcmsUserRepository(): Module {
  return {
    name: 'Create user repository',
    initialize({ next }) {
      const name = 'User repository';
      const collection = `${BCMSConfig.database.prefix}_users`;

      BCMSRepo.user = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSUser, BCMSUserRepositoryMethods>({
            collection,
            name,
            schema: BCMSUserFSDBSchema,
            methods({ repo }) {
              return {
                async findByEmail(email) {
                  return await repo.findBy((e) => e.email === email);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSUser,
            BCMSUserRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSUserMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByEmail(email) {
                  const cacheHit = cacheHandler.findOne(
                    (e) => e.email === email,
                  );
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const result = await mongoDBInterface.findOne({ email });
                  if (result) {
                    cacheHandler.set(result._id, result);
                  }
                  return result;
                },
              };
            },
          });

      next();
    },
  };
}
