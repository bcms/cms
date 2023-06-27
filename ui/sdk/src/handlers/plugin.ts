import type { BCMSPlugin, BCMSPluginHandler, BCMSPluginHandlerConfig } from '../types';

export function createBcmsPluginHandler({
  send,
}: BCMSPluginHandlerConfig): BCMSPluginHandler {
  let plugins: BCMSPlugin[] | null = null;

  return {
     async getAll() {
       if (plugins) {
         return plugins;
       }
       const result = await send<{items: BCMSPlugin[]}>({
         url: '/plugin/list/policy',
         method: 'get',
         headers: {
           Authorization: ''
         }
       })
       plugins = result.items;
       return result.items;
     },
  }
}
