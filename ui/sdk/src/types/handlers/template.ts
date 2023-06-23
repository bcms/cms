import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSTemplate,
  BCMSTemplateCreateData,
  BCMSTemplateUpdateData,
} from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSTemplateHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export type BCMSTemplateHandler = BCMSDefaultHandler<
  BCMSTemplate,
  BCMSTemplateCreateData,
  BCMSTemplateUpdateData
>;
