export interface BCMSUserPolicyCRUD {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}

export interface BCMSUserPolicyTemplate extends BCMSUserPolicyCRUD {
  _id: string;
}

export interface BCMSUserPolicyPluginOption {
  name: string;
  value: string[];
}

export interface BCMSUserPolicyPlugin {
  name: string;
  allowed: boolean;
  fullAccess: boolean;
  options: BCMSUserPolicyPluginOption[];
}

export interface BCMSUserPolicy {
  media: BCMSUserPolicyCRUD;
  templates: BCMSUserPolicyTemplate[];
  plugins?: BCMSUserPolicyPlugin[];
}
