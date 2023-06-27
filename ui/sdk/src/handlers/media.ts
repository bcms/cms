import type {
  BCMSMedia,
  BCMSMediaHandler,
  BCMSMediaHandlerConfig,
} from '../types';
import { Buffer } from 'buffer';
import FormData from 'form-data';

export function createBcmsMediaHandler({
  send,
  isLoggedIn,
  storage,
  cache,
  stringUtil,
}: BCMSMediaHandlerConfig): BCMSMediaHandler {
  const baseUri = '/media';
  const latch: {
    getAll: boolean;
    getByParentId: {
      [parentId: string]: boolean;
    };
  } = {
    getAll: false,
    getByParentId: {},
  };

  const self: BCMSMediaHandler = {
    async getAll() {
      if (latch.getAll) {
        return cache.getters.items({ name: 'media' });
      }
      const result: {
        items: BCMSMedia[];
      } = await send({
        url: `${baseUri}/all`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      latch.getAll = true;
      cache.mutations.set({ payload: result.items, name: 'media' });
      return result.items;
    },
    async getAllByParentId(id, skipCache) {
      if (!skipCache) {
        if (latch.getByParentId[id]) {
          return cache.getters.find({
            query: (e) => e.parentId === id,
            name: 'media',
          });
        }
      }
      const result: {
        items: BCMSMedia[];
      } = await send({
        url: `${baseUri}/all/parent/${id}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      latch.getByParentId[id] = true;
      cache.mutations.set({ payload: result.items, name: 'media' });
      return result.items;
    },
    async getMany(ids, skipCache) {
      let cacheHits: BCMSMedia[] = [];
      let missingIds: string[] = [];
      if (!skipCache) {
        cacheHits = cache.getters.find({
          query: (e) => ids.includes(e._id),
          name: 'media',
        });
        if (cacheHits.length !== ids.length) {
          for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (!cacheHits.find((e) => e._id === id)) {
              missingIds.push(id);
            }
          }
        } else {
          return cacheHits;
        }
      } else {
        missingIds = ids;
      }
      const result: { items: BCMSMedia[] } = await send({
        url: `${baseUri}/many`,
        method: 'GET',
        headers: {
          Authorization: '',
          'X-Bcms-Ids': missingIds.join('-'),
        },
      });
      cache.mutations.set({ payload: result.items, name: 'media' });
      return [...cacheHits, ...result.items];
    },
    async getById(id, skipCache) {
      if (!skipCache) {
        const cacheHit = cache.getters.findOne<BCMSMedia>({
          query: (e) => e._id === id,
          name: 'media',
        });
        if (cacheHit) {
          return cacheHit;
        }
      }
      const result: { item: BCMSMedia } = await send({
        url: `${baseUri}/${id}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ payload: result.item, name: 'media' });
      return result.item;
    },
    async getBinary(id, size) {
      return await send({
        url: `${baseUri}/${id}/bin${size ? '/' + size : ''}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
        responseType: 'arraybuffer',
      });
    },
    async getVideoThumbnail(id) {
      if (!(await isLoggedIn())) {
        return null;
      }
      const act = await storage.get('at');
      const result: Buffer = await send({
        url: `${baseUri}/${id}/vid/bin/thumbnail?act=${act}`,
        method: 'GET',
        responseType: 'arraybuffer',
      });
      return result;
    },
    async requestUploadToken() {
      const result = await send<{
        token: string;
      }>({
        url: `${baseUri}/request-upload-token`,
        method: 'post',
        headers: {
          Authorization: '',
        },
      });
      return result.token;
    },
    async createFile(data) {
      let fileName: string;
      if (data.file instanceof Buffer) {
        if (!data.fileName) {
          throw Error('File name is required for file of type Buffer.');
        }
        fileName = data.fileName;
      } else {
        fileName = data.file.name;
      }
      const filenameParts = fileName.split('.');
      const filename =
        stringUtil.toSlug(
          filenameParts.splice(0, filenameParts.length - 1).join('.'),
        ) +
        '.' +
        filenameParts[filenameParts.length - 1];
      const formData = new FormData();
      formData.append('media', data.file, filename);
      const uploadToken = await self.requestUploadToken();
      const result: {
        item: BCMSMedia;
      } = await send({
        onUploadProgress: data.onProgress,
        url: `${baseUri}/file${
          typeof data.parentId !== 'undefined'
            ? `?parentId=${data.parentId}`
            : ''
        }`,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data${
            typeof formData.getBoundary !== 'undefined'
              ? `; boundary=${formData.getBoundary()}`
              : ''
          }`,
          'X-Bcms-Upload-Token': uploadToken,
        },
        data: formData,
      });
      cache.mutations.set({ payload: result.item, name: 'media' });
      return result.item;
    },
    async createDir(data) {
      const result: { item: BCMSMedia } = await send({
        url: `${baseUri}/dir`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: result.item, name: 'media' });
      return result.item;
    },
    async updateFile(data) {
      const result: { item: BCMSMedia } = await send({
        url: `${baseUri}/file`,
        method: 'PUT',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: result.item, name: 'media' });
      return result.item;
    },
    async count() {
      if (latch.getAll) {
        return cache.getters.items({ name: 'media' }).length;
      }
      const result: { count: number } = await send({
        url: `${baseUri}/count`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.count;
    },
    async deleteById(id) {
      await send({
        url: `${baseUri}/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: '',
        },
      });
      const cacheHit = cache.getters.findOne<BCMSMedia>({
        query: (e) => e._id === id,
        name: 'media',
      });
      if (cacheHit) {
        cache.mutations.remove({ payload: cacheHit, name: 'media' });
      }
    },
    async duplicateFile(data) {
      const result: { item: BCMSMedia } = await send({
        url: `${baseUri}/duplicate`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: result.item, name: 'media' });
      return result.item;
    },
    async moveFile(data) {
      const result: { item: BCMSMedia } = await send({
        url: `${baseUri}/move`,
        method: 'PUT',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: result.item, name: 'media' });
      return result.item;
    },
  };

  return self;
}
