import type { BCMSLanguage } from './models';

export interface BCMSLanguageFactory {
  create(data: {
    code?: string;
    name?: string;
    nativeName?: string;
    def?: boolean;
    userId?: string;
  }): BCMSLanguage;
}
