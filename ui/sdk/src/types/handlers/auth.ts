import type { BCMSStorage, SendFunction } from '@becomes/cms-sdk/types';

export interface BCMSAuthHandlerConfig {
  send: SendFunction;
  storage: BCMSStorage;
}

export interface BCMSAuthHandler {
  shouldSignUp(): Promise<boolean>;
  signUpAdmin(data: {
    serverToken: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void>;
  login(data: { email: string; password: string }): Promise<void>;
}
