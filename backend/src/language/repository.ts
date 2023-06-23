import { BCMSConfig } from '@backend/config';
import { BCMSFactory } from '@backend/factory';
import { BCMSRepo } from '@backend/repo';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import type { Module } from '@becomes/purple-cheetah/types';
import {
  BCMSLanguage,
  BCMSLanguageFSDBSchema,
  BCMSLanguageMongoDBSchema,
  BCMSLanguageRepositoryMethods,
} from '../types';

export async function initBcmsLanguageRepository(): Promise<void> {
  const langs = await BCMSRepo.language.findAll();
  if (langs.length === 0) {
    const lang = BCMSFactory.language.create({
      code: 'en',
      def: true,
      name: 'English',
      nativeName: 'English',
      userId: '',
    });
    await BCMSRepo.language.add(lang);
  }
}

export function createBcmsLanguageRepository(): Module {
  return {
    name: 'Create language repository',
    initialize({ next }) {
      const name = 'Language repository';
      const collection = `${BCMSConfig.database.prefix}_languages`;

      BCMSRepo.language = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSLanguage, BCMSLanguageRepositoryMethods>({
            name,
            collection,
            schema: BCMSLanguageFSDBSchema,
            methods({ repo }) {
              return {
                async findByCode(code) {
                  return await repo.findBy((e) => e.code === code);
                },
                async findByDefault() {
                  return await repo.findBy((e) => e.def === true);
                },
              };
            },
          })
        : createMongoDBCachedRepository<
            BCMSLanguage,
            BCMSLanguageRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSLanguageMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByCode(code) {
                  const cacheHit = cacheHandler.findOne((e) => e.code === code);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const lang = await mongoDBInterface.findOne({ code });
                  if (lang) {
                    cacheHandler.set(lang._id, lang);
                  }
                  return lang;
                },
                async findByDefault() {
                  const cacheHit = cacheHandler.findOne((e) => e.def === true);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const lang = await mongoDBInterface.findOne({ def: true });
                  if (lang) {
                    cacheHandler.set(lang._id, lang);
                  }
                  return lang;
                },
              };
            },
          });

      next();
    },
  };
}
