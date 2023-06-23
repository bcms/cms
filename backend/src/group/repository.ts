import type { Module } from '@becomes/purple-cheetah/types';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb';
import { createMongoDBCachedRepository } from '@becomes/purple-cheetah-mod-mongodb-mem-cache';
import {
  BCMSGroup,
  BCMSGroupFSDBSchema,
  BCMSGroupMongoDBSchema,
  BCMSGroupRepositoryMethods,
  BCMSPropEntryPointerData,
  BCMSPropGroupPointerData,
  BCMSPropMediaData,
  BCMSPropTagData,
  BCMSPropType,
  BCMSPropWidgetData,
} from '../types';
import { BCMSRepo } from '@backend/repo';
import { BCMSConfig } from '@backend/config';

export function createBcmsGroupRepository(): Module {
  return {
    name: 'Create group repository',
    initialize({ next }) {
      const name = 'Group repository';
      const collection = `${BCMSConfig.database.prefix}_groups`;

      BCMSRepo.group = BCMSConfig.database.fs
        ? createFSDBRepository<BCMSGroup, BCMSGroupRepositoryMethods>({
            name,
            collection,
            schema: BCMSGroupFSDBSchema,
            methods({ repo }) {
              return {
                async findByName(nm) {
                  return await repo.findBy((e) => e.name === nm);
                },
                async findAllByPropGroupPointer(groupId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.GROUP_POINTER &&
                          (p.defaultData as BCMSPropGroupPointerData)._id ===
                            groupId,
                      ),
                  );
                },
                async findAllByPropEntryPointer(templateId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.ENTRY_POINTER &&
                          (p.defaultData as BCMSPropEntryPointerData[]).find(
                            (d) => d.templateId === templateId,
                          ),
                      ),
                  );
                },
                async findAllByPropTag(tagId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.TAG &&
                          (p.defaultData as BCMSPropTagData).includes(tagId),
                      ),
                  );
                },
                async findAllByPropMedia(mediaId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.MEDIA &&
                          (p.defaultData as BCMSPropMediaData[]).includes(
                            mediaId,
                          ),
                      ),
                  );
                },
                async findAllByPropWidget(widgetId) {
                  return await repo.findAllBy(
                    (e) =>
                      !!e.props.find(
                        (p) =>
                          p.type === BCMSPropType.WIDGET &&
                          (p.defaultData as BCMSPropWidgetData)._id ===
                            widgetId,
                      ),
                  );
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
            BCMSGroup,
            BCMSGroupRepositoryMethods,
            undefined
          >({
            name,
            collection,
            schema: BCMSGroupMongoDBSchema,
            methods({ mongoDBInterface, cacheHandler }) {
              return {
                async findByName(nm) {
                  const cacheHit = cacheHandler.findOne((e) => e.name === nm);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const group = await mongoDBInterface.findOne({ name: nm });
                  if (group) {
                    cacheHandler.set(group._id, group);
                  }
                  return group;
                },
                async findByCid(cid) {
                  const cacheHit = cacheHandler.findOne((e) => e.cid === cid);
                  if (cacheHit) {
                    return cacheHit;
                  }
                  const group = await mongoDBInterface.findOne({ cid });
                  if (group) {
                    cacheHandler.set(group._id, group);
                  }
                  return group;
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
                async findAllByPropGroupPointer(groupId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.GROUP_POINTER,
                    'props.defaultData._id': groupId,
                  });
                },
                async findAllByPropEntryPointer(templateId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.ENTRY_POINTER,
                    'props.defaultData.templateId': templateId,
                  });
                },
                async findAllByPropTag(tagId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.TAG,
                    'props.defaultData': tagId,
                  });
                },
                async findAllByPropMedia(mediaId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.MEDIA,
                    'props.defaultData': mediaId,
                  });
                },
                async findAllByPropWidget(widgetId) {
                  // TODO: Try to implement caching
                  return await mongoDBInterface.find({
                    'props.type': BCMSPropType.WIDGET,
                    'props.defaultData': widgetId,
                  });
                },
              };
            },
          });

      next();
    },
  };
}
