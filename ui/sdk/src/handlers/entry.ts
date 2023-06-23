import type {
  BCMSEntry,
  BCMSEntryHandler,
  BCMSEntryHandlerConfig,
  BCMSEntryLite,
  BCMSEntryParsed,
} from '../types';

export function createBcmsEntryHandler({
  send,
  cache,
}: BCMSEntryHandlerConfig): BCMSEntryHandler {
  const baseUri = '/entry';

  const getAllLatch: {
    getAllLite: { [templateId: string]: boolean };
    getAllParsed: { [templateId: string]: boolean };
    count: { [templateId: string]: boolean };
    getAll: { [templateId: string]: boolean };
  } = {
    getAllLite: {},
    getAllParsed: {},
    count: {},
    getAll: {},
  };
  const self: BCMSEntryHandler = {
    async getAllByTemplateId(data) {
      if (getAllLatch.getAll[data.templateId]) {
        return cache.getters.find({
          query: (e) => e.templateId === data.templateId,
          name: 'entry',
        });
      }
      const result: { items: BCMSEntry[] } = await send({
        url: `${baseUri}/all/${data.templateId}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      getAllLatch.getAll[data.templateId] = true;
      cache.mutations.set({ payload: result.items, name: 'entry' });
      return result.items;
    },
    async getAllLite(data) {
      if (getAllLatch.getAllLite[data.templateId]) {
        return cache.getters.find({
          query: (e) => e.templateId === data.templateId,
          name: 'entryLite',
        });
      }
      const result: { items: BCMSEntryLite[] } = await send({
        url: `${baseUri}/all/${data.templateId}/lite`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      getAllLatch.getAllLite[data.templateId] = true;
      cache.mutations.set({ payload: result.items, name: 'entryLite' });
      return result.items;
    },
    async getAllParsed(data) {
      const result: { items: BCMSEntryParsed[] } = await send({
        url: `${baseUri}/all/${data.templateId}/parse`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.items;
    },
    async getManyLite(data) {
      let cacheHits: BCMSEntryLite[] = [];
      let missingIds: string[] = [];
      if (!data.skipCache) {
        cacheHits = cache.getters.find({
          query: (e) =>
            e.templateId === data.templateId && data.entryIds.includes(e._id),
          name: 'entryLite',
        });
        if (cacheHits.length === data.entryIds.length) {
          return cacheHits;
        }
        for (let i = 0; i < data.entryIds.length; i++) {
          const entryId = data.entryIds[i];
          if (!cacheHits.find((e) => e._id === entryId)) {
            missingIds.push(entryId);
          }
        }
      } else {
        missingIds = data.entryIds;
      }
      const result: { items: BCMSEntryLite[] } = await send({
        url: `${baseUri}/many/${data.templateId}`,
        method: 'GET',
        headers: {
          Authorization: '',
          'X-Bcms-Ids': data.entryIds.join('-'),
        },
      });
      cache.mutations.set({ payload: result.items, name: 'entryLite' });
      return [...cacheHits, ...result.items];
    },
    async getLite(data) {
      if (!data.skipCache) {
        const cacheHit = cache.getters.findOne<BCMSEntryLite>({
          query: (e) => e._id === data.entryId,
          name: 'entryLite',
        });
        if (cacheHit) {
          return cacheHit;
        }
      }
      const result: { item: BCMSEntryLite } = await send({
        url: `${baseUri}/${data.templateId}/${data.entryId}/lite`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ payload: result.item, name: 'entryLite' });
      return result.item;
    },
    async get(data) {
      if (!data.skipCache) {
        const cacheHit = cache.getters.findOne<BCMSEntry>({
          query: (e) => e._id === data.entryId,
          name: 'entry',
        });
        if (cacheHit) {
          return cacheHit;
        }
      }
      const result: { item: BCMSEntry } = await send({
        url: `${baseUri}/${data.templateId}/${data.entryId}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ payload: result.item, name: 'entry' });
      return result.item;
    },
    async getOneParsed(data) {
      const result: { item: BCMSEntryParsed } = await send({
        url: `${baseUri}/${data.templateId}/${data.entryId}/parse/${
          typeof data.maxDepth === 'number' ? data.maxDepth : 2
        }`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.item;
    },
    async whereIsItUsed(data) {
      const result: {
        entries: Array<{ eid: string; tid: string }>;
      } = await send({
        url: `${baseUri}/${data.templateId}/${data.entryId}/where-is-it-used`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.entries;
    },
    async count(data) {
      if (!getAllLatch.count[data.templateId]) {
        return cache.getters.find<BCMSEntry>({
          query: (e) => e.templateId === data.templateId,
          name: 'entryLite',
        }).length;
      }
      const result: { count: number } = await send({
        url: `${baseUri}/count/${data.templateId}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.count;
    },
    async countByUser() {
      const result: { count: number } = await send({
        url: `${baseUri}/count/by-user`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.count;
    },
    async create(data) {
      const result: {
        item: BCMSEntry;
      } = await send({
        url: `${baseUri}/${data.templateId}`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: result.item, name: 'entry' });
      cache.mutations.set<BCMSEntryLite>({
        payload: {
          _id: result.item._id,
          createdAt: result.item.createdAt,
          updatedAt: result.item.updatedAt,
          cid: result.item.cid,
          templateId: result.item.templateId,
          userId: result.item.userId,
          meta: result.item.meta.map((meta) => {
            return {
              lng: meta.lng,
              props: meta.props.slice(0, 2),
            };
          }),
        },
        name: 'entryLite',
      });
      return result.item;
    },
    async update(data) {
      const result: {
        item: BCMSEntry;
      } = await send({
        url: `${baseUri}/${data.templateId}`,
        method: 'PUT',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: result.item, name: 'entry' });
      await self.getLite({
        templateId: data.templateId,
        entryId: data._id,
        skipCache: true,
      });
      return result.item;
    },
    async deleteById(data) {
      const result: { message: string } = await send({
        url: `${baseUri}/${data.templateId}/${data.entryId}`,
        method: 'DELETE',
        headers: {
          Authorization: '',
        },
        data,
      });
      const entryLiteCacheHit = cache.getters.findOne({
        query: (e) => e._id === data.entryId,
        name: 'entryLite',
      });
      if (entryLiteCacheHit) {
        cache.mutations.remove({
          payload: entryLiteCacheHit,
          name: 'entryLite',
        });
      }
      const entryCacheHit = cache.getters.findOne({
        query: (e) => e._id === data.entryId,
        name: 'entry',
      });
      if (entryCacheHit) {
        cache.mutations.remove({
          payload: entryCacheHit,
          name: 'entry',
        });
      }
      return result.message;
    },
  };

  return self;
}
