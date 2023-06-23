import type {
  BCMSApiKey,
  BCMSApiKeyAddData,
  BCMSApiKeyHandler,
  BCMSApiKeyHandlerConfig,
  BCMSApiKeyUpdateData,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsApiKeyHandler({
  send,
  cache,
}: BCMSApiKeyHandlerConfig): BCMSApiKeyHandler {
  return createBcmsDefaultHandler<
    BCMSApiKey,
    BCMSApiKeyAddData,
    BCMSApiKeyUpdateData
  >({
    baseUri: '/key',
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'apiKey', cache }),
  });
}
