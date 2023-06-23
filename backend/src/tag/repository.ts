import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import {
  BCMSTag,
  BCMSTagFSDBSchema,
  BCMSTagMongoDBSchema,
  BCMSTagRepositoryMethods,
} from '@backend/types';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';

export function createBcmsTagRepository(): Module {
  return {
    name: 'Create tag respoitory',
    initialize({ next }) {
      const name = 'Tag repository';
      const collection = `${BCMSConfig.database.prefix}_tags`;

      BCMSRepo.tag = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSTag, BCMSTagRepositoryMethods>({
            name,
            collection,
            schema: BCMSTagFSDBSchema,
            methods({ repo }) {
              return {
                async findByValue(vl) {
                  return await repo.findBy((e) => e.value === vl);
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
            BCMSTag,
            BCMSTagRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSTagMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByValue(vl) {
                  const cacheHit = cacheHandler.findOne((e) => e.value === vl);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const tag = await mongoDBInterface.findOne({ value: vl });
                  if (tag) {
                    cacheHandler.set(tag._id, tag);
                  }
                  return tag;
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
