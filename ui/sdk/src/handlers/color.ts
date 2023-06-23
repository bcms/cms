import type {
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorUpdateData,
} from '../types';
import type {
  BCMSColorHandler,
  BCMSColorHandlerConfig,
} from '../types/handlers/color';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsColorHandler({
  send,
  cache,
}: BCMSColorHandlerConfig): BCMSColorHandler {
  const baseUri = '/color';
  return createBcmsDefaultHandler<
    BCMSColor,
    BCMSColorCreateData,
    BCMSColorUpdateData
  >({
    baseUri,
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'color', cache }),
  });
}
