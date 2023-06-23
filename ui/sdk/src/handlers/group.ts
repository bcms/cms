import type {
  BCMSGroup,
  BCMSGroupAddData,
  BCMSGroupHandler,
  BCMSGroupHandlerConfig,
  BCMSGroupLite,
  BCMSGroupUpdateData,
  BCMSGroupWhereIsItUsedResponse,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsGroupHandler({
  send,
  cache,
}: BCMSGroupHandlerConfig): BCMSGroupHandler {
  const baseUri = '/group';
  const defaultHandler = createBcmsDefaultHandler<
    BCMSGroup,
    BCMSGroupAddData,
    BCMSGroupUpdateData
  >({
    baseUri,
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'group', cache }),
  });

  let getAllLiteLatch = false;

  return {
    ...defaultHandler,
    async getAllLite() {
      if (getAllLiteLatch) {
        return cache.getters.items({ name: 'groupLite' });
      }
      const result: {
        items: BCMSGroupLite[];
      } = await send({
        url: baseUri + '/all/lite',
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      cache.mutations.set({ name: 'groupLite', payload: result.items });
      getAllLiteLatch = true;
      return result.items;
    },
    async whereIsItUsed(id) {
      const result: BCMSGroupWhereIsItUsedResponse = await send({
        url: `${baseUri}/${id}/where-is-it-used`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result;
    },
  };
}
