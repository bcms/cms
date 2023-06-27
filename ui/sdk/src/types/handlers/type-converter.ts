import type { SendFunction } from '../main';
import type { BCMSTypeConverterResultItem } from '../models';

export interface BCMSTypeConverterHandlerConfig {
  send: SendFunction;
}

export type BCMSTypeConverterLanguage = 'typescript' | 'JSDoc';

export interface BCMSTypeConverterHandler {
  getAll(
    language: BCMSTypeConverterLanguage,
  ): Promise<BCMSTypeConverterResultItem[]>;
  get(data: {
    itemId: string;
    language: BCMSTypeConverterLanguage;
    type: 'group' | 'widget' | 'entry' | 'template';
  }): Promise<BCMSTypeConverterResultItem[]>;
}
