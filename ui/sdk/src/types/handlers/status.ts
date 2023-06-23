import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusUpdateData,
} from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSStatusHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export type BCMSStatusHandler = BCMSDefaultHandler<
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusUpdateData
>;
