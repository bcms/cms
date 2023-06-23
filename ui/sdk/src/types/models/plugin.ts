export type BCMSPluginPolicyType =
  | 'checkbox'
  | 'select'
  | 'selectArray'
  | 'input'
  | 'inputArray';

export interface BCMSPluginPolicy {
  name: string;
  type?: BCMSPluginPolicyType;
  options?: string[];
  default?: string[];
}

export interface BCMSPlugin {
  name: string;
  policies: BCMSPluginPolicy[];
}
