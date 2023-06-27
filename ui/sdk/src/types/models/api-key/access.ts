import type { BCMSUserPolicyCRUD } from '../user';

export interface BCMSApiKeyAccessTemplate extends BCMSUserPolicyCRUD {
  _id: string;
  name: string;
}

export interface BCMSApiKeyAccess {
  templates: BCMSApiKeyAccessTemplate[];
  functions: Array<{
    name: string;
  }>;
  plugins?: Array<{
    name: string;
  }>;
}
