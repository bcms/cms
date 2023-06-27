import type {
  BCMSClientTypeConverterHandler,
  BCMSTypeConverterResultItem,
  SendFunction,
} from '../types';

export function createBcmsClientTypeConverterHandler({
  send,
}: {
  send: SendFunction;
}): BCMSClientTypeConverterHandler {
  return {
    async getAll(data) {
      const result = await send<{ items: BCMSTypeConverterResultItem[] }>({
        url: `/type-converter/${data.language}/all`,
        method: 'GET',
      });
      return result.items;
    },
    async get(data) {
      const result = await send<{ items: BCMSTypeConverterResultItem[] }>({
        url: `/type-converter/${data.itemId}/${data.itemType}/${data.language}`,
        method: 'GET',
      });
      return result.items;
    },
  };
}
