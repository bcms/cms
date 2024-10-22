import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type {
  BCMSJwt,
  BCMSUser,
  BCMSUserPolicyCRUD,
  BCMSUserPolicyTemplate,
  BCMSUserPolicyPlugin,
  BCMSUserCreateBody,
  BCMSJwtRoleName,
} from '../models';

export interface BCMSUserHandlerConfig {
  cache: BCMSSdkCache;
  send: SendFunction;
  getAccessToken(): BCMSJwt | null;
  logout(): Promise<void>;
}

export interface BCMSUserUpdateData {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: BCMSJwtRoleName;
  customPool?: {
    policy?: {
      media?: BCMSUserPolicyCRUD;
      templates?: BCMSUserPolicyTemplate[];
      plugins?: BCMSUserPolicyPlugin[];
    };
  };
}

export interface BCMSUserHandler {
  get(id?: string, skipCache?: boolean): Promise<BCMSUser>;
  getAll(): Promise<BCMSUser[]>;
  create(data: BCMSUserCreateBody): Promise<BCMSUser>;
  update(data: BCMSUserUpdateData): Promise<BCMSUser>;
  logout(): Promise<void>;
  deleteById(id: string): Promise<BCMSUser>;
}
