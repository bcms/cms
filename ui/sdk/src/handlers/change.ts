import type { BCMSChangeHandlerConfig, BCMSChangeHandler } from '../types';

export function createBcmsChangeHandler({
  send,
}: BCMSChangeHandlerConfig): BCMSChangeHandler {
  const baseUri = '/changes';
  return {
    async getInfo() {
      return await send({
        url: `${baseUri}/info`,
        method: 'GET',
        headers: {
          Authorization: '',
        },
      });
    },
  };
}
