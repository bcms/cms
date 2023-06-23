import type { SendFunction } from '../main';
import type { BCMSGetAllSearchResultItem } from '../models';

export interface BCMSSearchHandlerConfig {
  send: SendFunction;
}

export interface BCMSSearchHandler {
  global(term: string): Promise<BCMSGetAllSearchResultItem[]>;
}
