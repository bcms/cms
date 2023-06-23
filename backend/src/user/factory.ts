import * as crypto from 'crypto';
import { Types } from 'mongoose';
import type { BCMSUser, BCMSUserFactory } from '../types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

export function createBcmsUserFactory(): BCMSUserFactory {
  return {
    create(data) {
      const user: BCMSUser = {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        email: data.email || '',
        username: data.username || '',
        password: data.password || '',
        roles: data.roles || [
          {
            name: JWTRoleName.USER,
            permissions: [
              {
                name: JWTPermissionName.READ,
              },
              {
                name: JWTPermissionName.WRITE,
              },
              {
                name: JWTPermissionName.DELETE,
              },
              {
                name: JWTPermissionName.EXECUTE,
              },
            ],
          },
        ],
        customPool: data.customPool || {
          personal: {
            firstName: '',
            lastName: '',
            avatarUri: '',
          },
          address: {},
          policy: {
            media: {
              get: false,
              post: false,
              put: false,
              delete: false,
            },
            templates: [],
            plugins: [],
          },
        },
      };

      return user;
    },
    toProtected(user) {
      return JSON.parse(
        JSON.stringify({
          _id: user._id,
          email: user.email,
          roles: user.roles,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          customPool: user.customPool,
        }),
      );
    },
    cloudUserToUser(cloudUser, policy) {
      return {
        _id: cloudUser._id,
        createdAt: cloudUser.createdAt,
        updatedAt: cloudUser.updatedAt,
        email: cloudUser.email,
        username: cloudUser.username,
        password: crypto.randomBytes(64).toString('base64'),
        customPool: {
          address: {
            city: '',
            country: '',
            state: '',
            street: {
              name: '',
              number: '',
            },
            zip: '',
          },
          personal: cloudUser.personal,
          policy: policy || {
            media: {
              delete: false,
              get: false,
              post: false,
              put: false,
            },
            templates: [],
            plugins: [],
          },
        },
        roles: [
          {
            name:
              cloudUser.roles[0].name === JWTRoleName.ADMIN
                ? JWTRoleName.ADMIN
                : JWTRoleName.USER,
            permissions: [
              {
                name: JWTPermissionName.READ,
              },
              {
                name: JWTPermissionName.WRITE,
              },
              {
                name: JWTPermissionName.DELETE,
              },
              {
                name: JWTPermissionName.EXECUTE,
              },
            ],
          },
        ],
      };
    },
  };
}
