import type {
  Controller,
  Middleware,
  ObjectSchema,
} from '@becomes/purple-cheetah/types';
import type { BCMSPluginInfo } from './info';
import type { BCMSPluginPolicy } from './policy';

export interface BCMSPluginConfig {
  name: string;
  policy?(): Promise<BCMSPluginPolicy[]>;
  controllers?: Controller[];
  middleware?: Middleware[];
}
export const BCMSPluginConfigSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  policy: {
    __type: 'function',
    __required: false,
  },
  controllers: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'function',
    },
  },
  middleware: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'function',
    },
  },
};

export interface BCMSPlugin {
  name: string;
  policy(): Promise<BCMSPluginPolicy[]>;
  controllers: Controller[];
  middleware: Middleware[];
}
export const BCMSPluginSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  policy: {
    __type: 'function',
    __required: true,
  },
  controllers: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
    },
  },
  middleware: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
    },
  },
};

export interface BCMSPluginManager {
  getList(): string[];
  getListInfo(): BCMSPluginInfo[];
}
