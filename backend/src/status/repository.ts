import { BCMSConfig } from '@backend/config';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { useStringUtility } from '@becomes/purple-cheetah';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSStatus,
  BCMSStatusFSDBSchema,
  BCMSStatusMongoDBSchema,
  BCMSStatusRepositoryMethods,
} from '../types';

export async function initBcmsStatusRepository(): Promise<void> {
  const stringUtil = useStringUtility();
  const draft = await BCMSRepo.status.methods.findByName(
    stringUtil.toSlugUnderscore('Draft'),
  );
  if (!draft) {
    await BCMSRepo.status.add(
      BCMSFactory.status.create({
        label: 'Draft',
        name: stringUtil.toSlugUnderscore('Draft'),
      }),
    );
  }
  const activeStatus = await BCMSRepo.status.methods.findByName(
    stringUtil.toSlugUnderscore('Active'),
  );
  if (!activeStatus) {
    await BCMSRepo.status.add(
      BCMSFactory.status.create({
        label: 'Active',
        name: stringUtil.toSlugUnderscore('Active'),
      }),
    );
  }
}

export function createBcmsStatusRepository(): Module {
  return {
    name: 'Create status repository',
    initialize({ next }) {
      const name = 'Status repository';
      const collection = `${BCMSConfig.database.prefix}_statuses`;

      BCMSRepo.status = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSStatus, BCMSStatusRepositoryMethods>({
            name,
            collection,
            schema: BCMSStatusFSDBSchema,
            methods({ repo }) {
              return {
                async findByName(nm) {
                  return await repo.findBy((e) => e.name === nm);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSStatus,
            BCMSStatusRepositoryMethods,
            unknown
          >({
            name,
            collection,
            schema: BCMSStatusMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(nm) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === nm);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const status = await mongoDBInterface.findOne({ name: nm });
                  if (status) {
                    cacheHandler.set(status._id, status);
                  }
                  return status;
                },
              };
            },
          });
      next();
    },
  };
}
