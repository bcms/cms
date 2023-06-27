import type { SendFunction } from '../main';
import type { BCMSChangeGetData } from '../models';

export interface BCMSChangeHandlerConfig {
  send: SendFunction;
}

export interface BCMSChangeHandler {
  getInfo(): Promise<BCMSChangeGetData>;
}