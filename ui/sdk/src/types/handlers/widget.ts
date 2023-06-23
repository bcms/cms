import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSWidget,
  BCMSWidgetCreateData,
  BCMSWidgetUpdateData,
} from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSWidgetHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export interface BCMSWidgetWhereIsItUsedResponse {
  entryIds: Array<{ tid: string; cid: string; _id: string }>;
}

export interface BCMSWidgetHandler
  extends BCMSDefaultHandler<
    BCMSWidget,
    BCMSWidgetCreateData,
    BCMSWidgetUpdateData
  > {
  whereIsItUsed(id: string): Promise<BCMSWidgetWhereIsItUsedResponse>;
}
