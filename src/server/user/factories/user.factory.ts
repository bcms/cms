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
