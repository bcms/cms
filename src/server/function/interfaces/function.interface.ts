import { Request } from 'express';

export enum FnType {
  STANDALONE = 'STANDALINE',
  EVENT_PIPE = 'EVENT_PIPE',
}

export interface FnEventInput {
  name: string;
  payload?: any;
}

export interface Fn {
  name: string;
  type: FnType;
  resolve: (request: Request, event?: FnEventInput) => Promise<any>;
}
