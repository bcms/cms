import type { SendFunction } from '../main';
import type { BCMSStorage } from '../storage';

export interface BCMSShimHandlerConfig {
  send: SendFunction;
  storage: BCMSStorage;
}

export interface BCMSShimHandler {
  verify: {
    otp(otp: string, user?: boolean): Promise<void>;
  };
}
