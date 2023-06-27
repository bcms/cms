import type { JWTRole } from '@becomes/purple-cheetah-mod-jwt/types';
import type { BCMSCloudUser } from '../shim';
import type {
  BCMSProtectedUser,
  BCMSUser,
  BCMSUserCustomPool,
  BCMSUserPolicy,
} from './models';

export interface BCMSUserFactory {
  create(data: {
    username?: string;
    email?: string;
    password?: string;
    roles?: JWTRole[];
    customPool?: BCMSUserCustomPool;
  }): BCMSUser;
  toProtected(user: BCMSUser): BCMSProtectedUser;
  cloudUserToUser(
    cloudUser: BCMSCloudUser,
    policy?: BCMSUserPolicy,
  ): BCMSUser;
}
