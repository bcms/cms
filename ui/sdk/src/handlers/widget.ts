import type {
  BCMSWidget,
  BCMSWidgetCreateData,
  BCMSWidgetHandler,
  BCMSWidgetHandlerConfig,
  BCMSWidgetUpdateData,
  BCMSWidgetWhereIsItUsedResponse,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsWidgetHandler({
  send,
  cache,
}: BCMSWidgetHandlerConfig): BCMSWidgetHandler {
  const baseUri = '/widget';
  const defaultHandler = createBcmsDefaultHandler<
    BCMSWidget,
    BCMSWidgetCreateData,
    BCMSWidgetUpdateData
  >({
    baseUri,
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'widget', cache }),
  });

  return {
    ...defaultHandler,
    async whereIsItUsed(id) {
      const result: BCMSWidgetWhereIsItUsedResponse = await send({
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
