import type {
  BCMSGetAllSearchResultItem,
  BCMSSearchHandler,
  BCMSSearchHandlerConfig,
} from '../types';

export function createBcmsSearchHandler({
  send,
}: BCMSSearchHandlerConfig): BCMSSearchHandler {
  const baseUri = '/search';

  return {
    async global(term) {
      const result: {
        items: BCMSGetAllSearchResultItem[];
      } = await send({
        url: `${baseUri}/all?term=${encodeURIComponent(term)}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.items;
    },
  };
}
