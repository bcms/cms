import type {
  BCMSTemplate,
  BCMSTemplateCreateData,
  BCMSTemplateHandler,
  BCMSTemplateHandlerConfig,
  BCMSTemplateUpdateData,
} from '../types';
import {
  createBcmsDefaultHandler,
  createBcmsDefaultHandlerCache,
} from './_defaults';

export function createBcmsTemplateHandler({
  send,
  cache,
}: BCMSTemplateHandlerConfig): BCMSTemplateHandler {
  const baseUri = '/template';
  return createBcmsDefaultHandler<
    BCMSTemplate,
    BCMSTemplateCreateData,
    BCMSTemplateUpdateData
  >({
    baseUri,
    send,
    cache: createBcmsDefaultHandlerCache({ name: 'template', cache }),
  });
}
