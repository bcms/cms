import { BCMSConfig } from '@backend/config';
import { BCMSRepo } from '@backend/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSMedia,
  BCMSMediaFSDBSchema,
  BCMSMediaMongoDBSchema,
  BCMSMediaRepositoryMethods,
} from '../types';

export function createBcmsMediaRepository(): Module {
  return {
    name: 'Create media repository',
    initialize({ next }) {
      const name = 'Media repository';
      const collection = `${BCMSConfig.database.prefix}_medias`;

      BCMSRepo.media = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSMedia, BCMSMediaRepositoryMethods>({
            name,
            collection,
            schema: BCMSMediaFSDBSchema,
            methods({ repo }) {
              return {
                async findAllByIsInRoot(isInRoot) {
                  return await repo.findAllBy((e) => e.isInRoot === isInRoot);
                },
                async findByNameAndParentId(nm, parentId) {
                  if (!parentId) {
                    return await repo.findBy(
                      (e) => e.name === nm && e.isInRoot === true,
                    );
                  } else {
                    return await repo.findBy(
                      (e) => e.name === nm && e.parentId === parentId,
                    );
                  }
                },
                async findAllByParentId(parentId) {
                  return await repo.findAllBy((e) => e.parentId === parentId);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSMedia,
            BCMSMediaRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSMediaMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              const latches: {
                isInRoot: boolean;
                path: {
                  [p: string]: boolean;
                };
                parent: {
                  [id: string]: boolean;
                };
              } = {
                isInRoot: false,
                path: {},
                parent: {},
              };
              return {
                async findAllByIsInRoot(isInRoot) {
                  if (latches.isInRoot) {
                    return cacheHandler.find((e) => e.isInRoot === isInRoot);
                  }
                  const media = await mongoDBInterface.find({ isInRoot });
                  media.forEach((m) => {
                    cacheHandler.set(m._id, m);
                  });
                  latches.isInRoot = true;
                  return media;
                },
                async findByNameAndParentId(nm, parentId) {
                  if (parentId) {
                    const cacheHit = cacheHandler.findOne(
                      (e) => e.parentId === parentId && e.name === nm,
                    );
                    if (cacheHit) {
                      return cacheHit;
                    }
                    const media = await mongoDBInterface.findOne({
                      parentId,
                      name: nm,
                    });
                    if (media) {
                      cacheHandler.set(media._id, media);
                    }
                    return media;
                  } else {
                    const cacheHit = cacheHandler.findOne(
                      (e) => e.isInRoot === true && e.name === nm,
                    );
                    if (cacheHit) {
                      return cacheHit;
                    }
                    const media = await mongoDBInterface.findOne({
                      isInRoot: true,
                      name: nm,
                    });
                    if (media) {
                      cacheHandler.set(media._id, media);
                    }
                    return media;
                  }
                },
                async findAllByParentId(parentId) {
                  if (latches.parent[parentId]) {
                    return cacheHandler.find((e) => e.parentId === parentId);
                  }
                  const media = await mongoDBInterface.find({ parentId });
                  media.forEach((m) => {
                    cacheHandler.set(m._id, m);
                  });
                  latches.parent[parentId] = true;
                  return media;
                },
              };
            },
          });

      next();
    },
  };
}
