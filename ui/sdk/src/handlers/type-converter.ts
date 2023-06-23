import type {
  BCMSTypeConverterHandler,
  BCMSTypeConverterHandlerConfig,
  BCMSTypeConverterResultItem,
} from '../types';

export function createBcmsTypeConverterHandler({
  send,
}: BCMSTypeConverterHandlerConfig): BCMSTypeConverterHandler {
  const baseUri = '/type-converter';

  return {
    async getAll(language) {
      const result: {
        items: BCMSTypeConverterResultItem[];
      } = await send({
        url: `${baseUri}/${language}/all`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.items;
    },
    async get(data) {
      const result: {
        items: BCMSTypeConverterResultItem[];
      } = await send({
        url: `${baseUri}/${data.itemId}/${data.type}/${data.language}`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      return result.items;
    },
  };
}
