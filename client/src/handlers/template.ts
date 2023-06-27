import {
  BCMSClientCacheManager,
  BCMSClientSocketHandler,
  BCMSClientTemplateHandler,
  BCMSSocketEventName,
  BCMSSocketEventType,
  BCMSSocketTemplateEvent,
  BCMSTemplate,
  SendFunction,
} from '../types';

export function createBcmsClientTemplateHandler({
  send,
  enableCache,
  socket,
  cacheManager,
}: {
  send: SendFunction;
  enableCache?: boolean;
  socket: BCMSClientSocketHandler;
  cacheManager: BCMSClientCacheManager;
}): BCMSClientTemplateHandler {
  const basePath = '/template';

  if (enableCache) {
    socket.subscribe(BCMSSocketEventName.TEMPLATE, async (event) => {
      const data = event.data as BCMSSocketTemplateEvent;
      if (data.t === BCMSSocketEventType.UPDATE) {
        if (cacheManager.template.findOne((e) => e._id === data.tm)) {
          await self.get({ template: data.tm });
        }
      } else {
        cacheManager.template.remove(data.tm);
      }
    });
  }

  const self: BCMSClientTemplateHandler = {
    async getAll(data) {
      const skipCache = data && data.skipCache;
      if (!skipCache && enableCache && cacheManager.template.all) {
        return cacheManager.template.items();
      }
      const result = await send<{ items: BCMSTemplate[] }>({
        url: `${basePath}/all`,
        method: 'GET',
      });
      if (enableCache) {
        cacheManager.template.all = true;
        cacheManager.template.set(result.items);
      }
      return result.items;
    },
    async get(data) {
      if (!data.skipCache && enableCache) {
        const cacheHit = cacheManager.template.findOne(
          (e) => e._id === data.template || e.name === data.template,
        );
        if (cacheHit) {
          return cacheHit;
        }
      }
      const result = await send<{ item: BCMSTemplate }>({
        url: `${basePath}/${data.template}`,
        method: 'GET',
      });
      if (enableCache) {
        cacheManager.template.set(result.item);
      }
      return result.item;
    },
  };

  return self;
}
