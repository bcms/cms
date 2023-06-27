import { BCMSConfig } from '@backend/config';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { BCMSChange, BCMSChangeFSDBSchema, BCMSChangeName } from '@backend/types';
import {
  BCMSChangeMongoDBSchema,
  BCMSChangeRepositoryMethods,
} from '@backend/types/change';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';

export async function initBcmsChangeRepository(): Promise<void> {
  const names: BCMSChangeName[] = [
    'color',
    'entry',
    'group',
    'language',
    'media',
    'status',
    'tag',
    'templates',
    'widget',
  ];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (!(await BCMSRepo.change.methods.findByName(name))) {
      await BCMSRepo.change.add(
        BCMSFactory.change.create({
          count: 0,
          name: name,
        }),
      );
    }
  }
}

export function createBcmsChangeRepository(): Module {
  return {
    name: 'Create change repository',
    initialize({ next }) {
      const name = 'Change repository';
      const collection = `${BCMSConfig.database.prefix}_changes`;

      BCMSRepo.change = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSChange, BCMSChangeRepositoryMethods>({
            name,
            collection,
            schema: BCMSChangeFSDBSchema,
            methods({ repo }) {
              return {
                async updateAndInc(change) {
                  change.count++;
                  return await repo.update(change);
                },
                async updateAndIncByName(changeName) {
                  const change = await repo.findBy(
                    (e) => e.name === changeName,
                  );
                  if (change) {
                    change.count++;
                    return await repo.update(change);
                  }
                  return null;
                },
                async findByName(changeName) {
                  return await repo.findBy((e) => e.name === changeName);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSChange,
            BCMSChangeRepositoryMethods,
            void
          >({
            name: name,
            collection,
            schema: BCMSChangeMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async updateAndInc(change) {
                  const result = await mongoDBInterface.findOneAndUpdate(
                    { _id: change._id },
                    {
                      updatedAt: Date.now(),
                      $inc: { count: 1 },
                    },
                  );
                  if (result) {
                    cacheHandler.set(result._id, result);
                  }
                  return result;
                },
                async updateAndIncByName(changeName) {
                  const result = await mongoDBInterface.findOneAndUpdate(
                    { name: changeName },
                    {
                      updatedAt: Date.now(),
                      $inc: { count: 1 },
                    },
                  );
                  if (result) {
                    cacheHandler.set(result._id, result);
                  }
                  return result;
                },
                async findByName(changeName) {
                  const cacheHit = cacheHandler.findOne(
                    (e) => e.name === changeName,
                  );
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const item = await mongoDBInterface.findOne({
                    name: changeName,
                  });
                  if (item) {
                    cacheHandler.set(item._id, item);
                  }
                  return item;
                },
              };
            },
          });

      next();
    },
  };
}
