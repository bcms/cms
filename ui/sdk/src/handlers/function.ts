import type {
  BCMSFunction,
  BCMSFunctionHandler,
  BCMSFunctionHandlerConfig,
} from '../types';

export function createBcmsFunctionHandler({
  send,
}: BCMSFunctionHandlerConfig): BCMSFunctionHandler {
  let getAllLatch = false;
  let functions: BCMSFunction[] = [];
  const baseUri = '/function';

  return {
    async getAll() {
      if (getAllLatch) {
        return functions;
      }
      const result: { items: BCMSFunction[] } = await send({
        url: `${baseUri}/all`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
      getAllLatch = true;
      functions = result.items;
      return JSON.parse(JSON.stringify(functions));
    },
  };
}
