import {
  BCMSClientCacheManager,
  BCMSClientMediaBinFn,
  BCMSClientMediaHandler,
  BCMSClientSocketHandler,
  BCMSMedia,
  BCMSSocketEventName,
  BCMSSocketEventType,
  BCMSSocketMediaEvent,
  SendFunction,
} from '../types';

export function createBcmsClientMediaHandler({
  send,
  enableCache,
  socket,
  cacheManager,
}: {
  send: SendFunction;
  enableCache?: boolean;
  socket: BCMSClientSocketHandler;
  cacheManager: BCMSClientCacheManager;
}): BCMSClientMediaHandler {
  const basePath = '/media';

  if (enableCache) {
    socket.subscribe(BCMSSocketEventName.MEDIA, async (event) => {
      const data = event.data as BCMSSocketMediaEvent;
      if (data.t === BCMSSocketEventType.UPDATE) {
        if (cacheManager.media.findOne((e) => e._id === data.m)) {
          await self.get(data.m);
        }
      } else {
        cacheManager.media.remove(data.m);
      }
    });
  }

  function binFn(media: BCMSMedia): BCMSClientMediaBinFn {
    return async (data) => {
      const onProgress =
        data && data.onProgress
          ? data.onProgress
          : (_progress: number) => {
              // Do nothing.
            };
      return await send<ArrayBuffer>({
        url: `${basePath}/${media._id}/bin`,
        method: 'GET',
        responseType: 'arraybuffer',
        onDownloadProgress:
          data && data.onProgress
            ? (event) => {
                onProgress((100 * event.loaded) / event.total);
              }
            : undefined,
      });
    };
  }

  const self: BCMSClientMediaHandler = {
    async download(id) {
      return await send<ArrayBuffer>({
        url: `${basePath}/${id}/bin`,
        method: 'GET',
        responseType: 'arraybuffer',
      });
    },
    async get(id, skipCache) {
      if (!skipCache && enableCache) {
        const cacheHit = cacheManager.media.findOne((e) => e._id === id);
        if (cacheHit) {
          return {
            ...cacheHit,
            bin: binFn(cacheHit),
          };
        }
      }
      const result = await send<{ item: BCMSMedia }>({
        url: `${basePath}/${id}`,
        method: 'GET',
      });
      if (enableCache) {
        cacheManager.media.set(result.item);
      }
      return {
        ...result.item,
        bin: binFn(result.item),
      };
    },
    async getAll(data) {
      const skipCache = data && data.skipCache;
      if (!skipCache && enableCache && cacheManager.media.all) {
        return cacheManager.media.items().map((item) => {
          return {
            ...item,
            bin: binFn(item),
          };
        });
      }
      const result = await send<{ items: BCMSMedia[] }>({
        url: `${basePath}/all`,
        method: 'GET',
      });
      if (enableCache) {
        cacheManager.media.all = true;
        cacheManager.media.set(result.items);
      }
      return result.items.map((item) => {
        return {
          ...item,
          bin: binFn(item),
        };
      });
    },
  };

  return self;
}
