import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBRepository } from '@becomes/purple-cheetah-mod-mongodb';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSIdCounter,
  BCMSIdCounterFSDBSchema,
  BCMSIdCounterMongoDBSchema,
  BCMSIdCounterRepositoryMethods,
} from '../types';

export function createBcmsIdCounterRepository(): Module {
  return {
    name: 'Create id counter repository',
    initialize({ next }) {
      const nm = 'ID counter repository';
      const collection = `${BCMSConfig.database.prefix}_id_counters`;

      BCMSRepo.idc = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSIdCounter, BCMSIdCounterRepositoryMethods>({
            name: nm,
            collection,
            schema: BCMSIdCounterFSDBSchema,
            methods({ repo }) {
              return {
                async findAndIncByForId(forId) {
                  const item = await repo.findBy((e) => e.forId === forId);
                  if (item) {
                    const count = item.count + 0;
                    item.count++;
                    await repo.update(item);
                    return count;
                  }
                  return null;
                },
                async findByForId(forId) {
                  return await repo.findBy((e) => e.forId === forId);
                },
              };
            },
          })
        : createMongoDBRepository<
            BCMSIdCounter,
            BCMSIdCounterRepositoryMethods
          >({
            name: nm,
            collection,
            schema: BCMSIdCounterMongoDBSchema,
            methods({ mongoDBInterface }) {
              return {
                async findByForId(forId) {
                  return await mongoDBInterface.findOne({ forId });
                },
                async findAndIncByForId(forId) {
                  const item = await mongoDBInterface.findOneAndUpdate(
                    { forId },
                    { $inc: { count: 1 } },
                  );
                  if (item) {
                    return item.count;
                  }
                  return null;
                },
              };
            },
          });

      next();
    },
  };
}
