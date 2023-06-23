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
