import type {
  JWTRole,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

export interface BCMSCloudUserOrg {
  id: string;
  nameEncoded: string;
  role: JWTRoleName;
  owner: boolean;
}

export interface BCMSCloudUserPersonal {
  firstName: string;
  lastName: string;
  avatarUri: string;
}

export interface BCMSCloudUser {
  _id: string;
  createdAt: number;
  updatedAt: number;
  username: string;
  email: string;
  personal: BCMSCloudUserPersonal;
  orgs: BCMSCloudUserOrg[];
  roles: JWTRole[];
}