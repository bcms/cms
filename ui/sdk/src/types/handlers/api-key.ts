import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSApiKey,
  BCMSApiKeyAddData,
  BCMSApiKeyUpdateData,
} from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSApiKeyHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export type BCMSApiKeyHandler = BCMSDefaultHandler<
  BCMSApiKey,
  BCMSApiKeyAddData,
  BCMSApiKeyUpdateData
>;
