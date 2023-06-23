import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSGroup,
  BCMSGroupAddData,
  BCMSGroupLite,
  BCMSGroupUpdateData,
} from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSGroupHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export interface BCMSGroupWhereIsItUsedResponse {
  templateIds: Array<{ cid: string; _id: string }>;
  groupIds: Array<{ cid: string; _id: string }>;
  widgetIds: Array<{ cid: string; _id: string }>;
}

export interface BCMSGroupHandler
  extends BCMSDefaultHandler<BCMSGroup, BCMSGroupAddData, BCMSGroupUpdateData> {
  whereIsItUsed(id: string): Promise<BCMSGroupWhereIsItUsedResponse>;
  getAllLite(): Promise<BCMSGroupLite[]>;
}
