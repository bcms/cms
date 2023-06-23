import type {
  BCMSTag,
  BCMSTagCreateData,
  BCMSTagHandler,
  BCMSTagHandlerConfig,
  BCMSTagUpdateData,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsTagHandler({
  send,
  cache,
}: BCMSTagHandlerConfig): BCMSTagHandler {
  const baseUri = '/tag';
  const defaultHandler = createBcmsDefaultHandler<
    BCMSTag,
    BCMSTagCreateData,
    BCMSTagUpdateData
  >({
    baseUri,
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'tag', cache }),
  });

  return {
    ...defaultHandler,
    async getByValue(value) {
      const cacheHit = cache.getters.findOne<BCMSTag>({
        name: 'tag',
        query: (e) => e.value === value,
      });
      if (cacheHit) {
        return cacheHit;
      }
      const result: { item: BCMSTag } = await send({
        url: `${baseUri}/value/${value}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ payload: result.item, name: 'tag' });
      return result.item;
    },
  };
}
