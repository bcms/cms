import type {
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerHandler,
  BCMSTemplateOrganizerHandlerConfig,
  BCMSTemplateOrganizerUpdateData,
} from '../types';
import { createBcmsDefaultHandler, createBcmsDefaultHandlerCache } from './_defaults';

export function createBcmsTemplateOrganizerHandler({
  send,
  cache,
}: BCMSTemplateOrganizerHandlerConfig): BCMSTemplateOrganizerHandler {
  const baseUri = '/template/organizer';
  return createBcmsDefaultHandler<
    BCMSTemplateOrganizer,
    BCMSTemplateOrganizerCreateData,
    BCMSTemplateOrganizerUpdateData
  >({
    baseUri,
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'templateOrganizer', cache }),
  });
}
