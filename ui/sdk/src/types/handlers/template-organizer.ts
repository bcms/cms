import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerUpdateData,
} from '../models';
import type { BCMSDefaultHandler } from './_defaults';

export interface BCMSTemplateOrganizerHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
}

export type BCMSTemplateOrganizerHandler = BCMSDefaultHandler<
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerUpdateData
>;
