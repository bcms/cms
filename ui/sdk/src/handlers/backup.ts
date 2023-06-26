import type {
  BCMSBackupHandler,
  BCMSBackupListItem,
  BCMSMediaHandler,
  BCMSSdkCache,
  SendFunction,
} from '../types';
import FormData from 'form-data';

export function createBcmsBackupHandler({
  send,
  mediaHandler,
  cache,
}: {
  send: SendFunction;
  mediaHandler: BCMSMediaHandler;
  cache: BCMSSdkCache;
}): BCMSBackupHandler {
  const baseUri = '/backup';

  return {
    async list() {
      const res = await send<{
        items: BCMSBackupListItem[];
      }>({
        url: `${baseUri}/list`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ payload: res.items, name: 'backupItem' });
      return res.items;
    },
    async getDownloadHash(data) {
      const res = await send<{
        hash: string;
      }>({
        url: `${baseUri}/${data.fileName}/hash`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return res.hash;
    },
    async create(data) {
      const res = await send<{
        item: BCMSBackupListItem;
      }>({
        url: `${baseUri}/create`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.set({ payload: res.item, name: 'backupItem' });
      return res.item;
    },
    async restoreEntities(data) {
      await send({
        url: `${baseUri}/restore-entities`,
        method: 'POST',
        headers: {
          Authorization: '',
        },
        data,
      });
    },
    async restoreMediaFile(data) {
      const formData = new FormData();
      formData.append('media', data.file, data.name);
      const uploadToken = await mediaHandler.requestUploadToken();
      await send({
        url: `${baseUri}/restore-media-file/${data.id}`,
        method: 'POST',
        headers: {
          'X-Bcms-Upload-Token': uploadToken,
          'Content-Type': `multipart/form-data${
            typeof formData.getBoundary !== 'undefined'
              ? `; boundary=${formData.getBoundary()}`
              : ''
          }`,
        },
        data: formData,
      });
    },
    async delete(data) {
      await send({
        url: `${baseUri}/delete`,
        method: 'DELETE',
        headers: {
          Authorization: '',
        },
        data,
      });
      cache.mutations.remove({
        payload: data.fileNames.map((e) => {
          return { _id: e };
        }),
        name: 'backupItem',
      });
    },
  };
}
