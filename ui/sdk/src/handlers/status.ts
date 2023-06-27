import type {
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusHandler,
  BCMSStatusHandlerConfig,
  BCMSStatusUpdateData,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsStatusHandler({
  send,
  cache,
}: BCMSStatusHandlerConfig): BCMSStatusHandler {
  return createBcmsDefaultHandler<
    BCMSStatus,
    BCMSStatusCreateData,
    BCMSStatusUpdateData
  >({
    baseUri: '/status',
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'status', cache }),
  });
}
