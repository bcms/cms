import { User } from '../models/user.model';
import { Types } from 'mongoose';
import { RefreshTokenFactory } from './refresh-token.factory';
import { RoleName, PermissionName } from 'purple-cheetah';

export class UserFactory {
  public static get instance(): User {
    return new User(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      '',
      '',
      '',
      [],
      [],
      {
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
          customPortal: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          templates: [],
          webhooks: [],
        },
      },
    );
  }

  public static admin(config: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUri?: string;
  }): User {
    return new User(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      config.username,
      config.email,
      '',
      [
        {
          name: RoleName.ADMIN,
          permissions: [
            {
              name: PermissionName.READ,
            },
            {
              name: PermissionName.WRITE,
            },
            {
              name: PermissionName.DELETE,
            },
            {
              name: PermissionName.EXECUTE,
            },
          ],
        },
      ],
      [],
      {
        personal: {
          firstName: config.firstName,
          lastName: config.lastName,
          avatarUri: config.avatarUri || '',
        },
        address: {},
        policy: {
          media: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          customPortal: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          templates: [],
          webhooks: [],
        },
      },
    );
  }

  public static user(config: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUri?: string;
  }): User {
    return new User(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      config.username,
      config.email,
      '',
      [
        {
          name: RoleName.USER,
          permissions: [
            {
              name: PermissionName.READ,
            },
            {
              name: PermissionName.WRITE,
            },
            {
              name: PermissionName.DELETE,
            },
            {
              name: PermissionName.EXECUTE,
            },
          ],
        },
      ],
      [],
      {
        personal: {
          firstName: config.firstName,
          lastName: config.lastName,
          avatarUri: config.avatarUri || '',
        },
        address: {},
        policy: {
          media: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          customPortal: {
            get: false,
            post: false,
            put: false,
            delete: false,
          },
          templates: [],
          webhooks: [],
        },
      },
    );
  }

  public static removeProtected(user: User): any {
    const u = JSON.parse(JSON.stringify(user));
    delete u.password;
    delete u.refreshTokens;
    return JSON.parse(JSON.stringify(u));
  }
}
