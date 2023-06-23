import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import {
  BCMSColor,
  BCMSColorFSDBSchema,
  BCMSColorMongoDBSchema,
  BCMSColorRepositoryMethods,
} from '@backend/types';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';

export function createBcmsColorRepository(): Module {
  return {
    name: 'Create color repository',
    initialize({ next }) {
      const name = 'Color repository';
      const collection = `${BCMSConfig.database.prefix}_colors`;

      BCMSRepo.color = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSColor, BCMSColorRepositoryMethods>({
            name,
            collection,
            schema: BCMSColorFSDBSchema,
            methods({ repo }) {
              return {
                async findByName(nm) {
                  return await repo.findBy((e) => e.name === nm);
                },
                async findByCid(cid) {
                  return await repo.findBy((e) => e.cid === cid);
                },
                async findAllByCid(cids) {
                  return await repo.findAllBy((e) => cids.includes(e.cid));
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSColor,
            BCMSColorRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSColorMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(nm) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === nm);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const color = await mongoDBInterface.findOne({ name: nm });
                  if (color) {
                    cacheHandler.set(color._id, color);
                  }
                  return color;
                },
                async findByCid(cid) {
                  const cacheHit = cacheHandler.findOne((e) => e.cid === cid);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const item = await mongoDBInterface.findOne({ cid });
                  if (item) {
                    cacheHandler.set(item._id, item);
                  }
                  return item;
                },
                async findAllByCid(cids) {
                  const missingCids: string[] = [];
                  const output = cacheHandler.find((e) => {
                    const found = cids.includes(e.cid);
                    if (!found) {
                      missingCids.push(e.cid);
                    }
                    return found;
                  });
                  if (missingCids.length > 0) {
                    const items = await mongoDBInterface.find({
                      cid: { $in: missingCids },
                    });
                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];
                      cacheHandler.set(item._id, item);
                      output.push(item);
                    }
                  }
                  return output;
                },
              };
            },
          });
      next();
    },
  };
}
