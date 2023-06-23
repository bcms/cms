import type { BCMSPlugin } from '../models';
import type { SendFunction } from '../main';

export interface BCMSPluginHandlerConfig {
  send: SendFunction;
}

export interface BCMSPluginHandler {
  getAll(): Promise<BCMSPlugin[]>;
}
