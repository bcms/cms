import type { BCMSColor, BCMSColorCreateData, BCMSColorUpdateData } from '..';
import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSColorHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export type BCMSColorHandler = BCMSDefaultHandler<
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorUpdateData
>;
