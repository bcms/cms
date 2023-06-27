import type { SendFunction } from "../main";
import type { BCMSFunction } from "../models";

export interface BCMSFunctionHandlerConfig {
  send: SendFunction;
}

export interface BCMSFunctionHandler {
  getAll(): Promise<BCMSFunction[]>
}