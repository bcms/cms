import type { BCMSApiKey, BCMSApiKeyAccess } from './models';

export interface BCMSApiKeyFactory {
  create(data: {
    userId: string;
    name: string;
    desc: string;
    blocked: boolean;
    access: BCMSApiKeyAccess;
  }): BCMSApiKey;
  rewriteKey(key: BCMSApiKey): { key: BCMSApiKey; modified: boolean };
}
