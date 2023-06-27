import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import {
  BCMSEventConfig,
  BCMSEventConfigMethod,
  BCMSEventConfigSchema,
  BCMSEventConfigScope,
} from './config';

export interface BCMSEventHandler<Payload> {
  (data: {
    scope: BCMSEventConfigScope | string;
    method: BCMSEventConfigMethod | string;
    payload: Payload;
  }): Promise<void>;
}

export interface BCMSEvent {
  config: BCMSEventConfig;
  handler: BCMSEventHandler<unknown>;
}
export const BCMSEventSchema: ObjectSchema = {
  config: {
    __type: 'object',
    __required: true,
    __child: BCMSEventConfigSchema,
  },
  handler: {
    __type: 'function',
    __required: true,
  },
};
