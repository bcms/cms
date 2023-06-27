import type {
  BCMSLanguage,
  BCMSLanguageAddData,
  BCMSLanguageHandler,
  BCMSLanguageHandlerConfig,
  BCMSLanguageUpdateData,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsLanguageHandler({
  send,
  cache,
}: BCMSLanguageHandlerConfig): BCMSLanguageHandler {
  return createBcmsDefaultHandler<
    BCMSLanguage,
    BCMSLanguageAddData,
    BCMSLanguageUpdateData
  >({
    baseUri: '/language',
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'language', cache }),
  });
}
