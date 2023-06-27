import type { BCMSEntity } from './_entity';

export interface BCMSUserPermission {
  name: string;
}
export interface BCMSUserRole {
  name: string;
  permission: BCMSUserPermission[];
}

export interface BCMSUserPersonal {
  firstName: string;
  lastName: string;
  avatarUri: string;
}
export interface BCMSUserAddress {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  street?: {
    name: string;
    number: string;
  };
}
export interface BCMSUserPolicyCRUD {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}
export interface BCMSUserPolicy {
  media: BCMSUserPolicyCRUD;
  templates: Array<{ _id: string } & BCMSUserPolicyCRUD>;
  plugins?: Array<{ name: string } & BCMSUserPolicyCRUD>;
}
export interface BCMSUserCustomPool {
  personal: BCMSUserPersonal;
  address: BCMSUserAddress;
  policy: BCMSUserPolicy;
}

export interface BCMSUser extends BCMSEntity {
  username: string;
  email: string;
  password: string;
  roles: BCMSUserRole[];
  customPool: BCMSUserCustomPool;
}
