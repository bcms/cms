import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type { BCMSTag, BCMSTagCreateData, BCMSTagUpdateData } from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSTagHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export interface BCMSTagHandler
  extends BCMSDefaultHandler<BCMSTag, BCMSTagCreateData, BCMSTagUpdateData> {
  getByValue(value: string): Promise<BCMSTag>;
}
