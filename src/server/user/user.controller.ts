import * as bcrypt from 'bcrypt';
import {
  Controller,
  AppLogger,
  Logger,
  Service,
  Get,
  HttpErrorFactory,
  HttpStatus,
  JWTEncoding,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  Post,
  ObjectUtility,
  Put,
  StringUtility,
  Delete,
} from 'purple-cheetah';
import { UserService } from './user.service';
import { Request } from 'express';
import { User } from './models/user.model';
import { UserFactory } from './factories/user.factory';
import { RefreshTokenFactory } from './factories/refresh-token.factory';
import { SecurityCodeBufferService } from './security-code-buffer.service';

/**
 * Controller that handles User object interaction.
 */
@Controller('/user')
export class UserController {
  @AppLogger(UserController)
  private logger: Logger;
  @Service(UserService)
  private userService: UserService;

  @Get('/is_initialized')
  async isInitialized(request: Request): Promise<{ initialized: boolean }> {
    const userCount = await this.userService.count();
    if (userCount > 0) {
      return {
        initialized: true,
      };
    }
    return {
      initialized: false,
    };
  }

  /**
   * Returns all Users in database without protected
   * properties like password and refresh tokens.
   *
   * @param request Is an ExpressJS request that must have JWT in
   * authorization header with `ADMIN` role.
   *
   * @return User object array.
   */
  @Get('/all')
  async getAll(request: Request): Promise<{ users: User[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const users = await this.userService.findAll();
    return {
      users: users.map(e => {
        return UserFactory.removeProtected(e);
      }),
    };
  }

  /**
   * Returns a User based on JWT. Property `userId` in JWT payload
   * will be used to determent User.
   *
   * @param request Is an ExpressJS request that must have JWT in
   * authorization header.
   */
  @Get('/me')
  async getByAccessToken(request: Request): Promise<{ user: User }> {
    const error = HttpErrorFactory.simple('.getByAccessToken', this.logger);
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const user = await this.userService.findById(jwt.payload.userId);
    if (user === null) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to find a User in database.',
      );
    }
    return {
      user: UserFactory.removeProtected(user),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ user: User }> {
    const error = HttpErrorFactory.simple('getById', this.logger);
    if (StringUtility.isIdValid(request.params.id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.params.id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const user = await this.userService.findById(request.params.id);
    if (user === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `User with ID '${request.params.id}' does not exist.`,
      );
    }
    return {
      user: UserFactory.removeProtected(user),
    };
  }

  @Put('/me')
  async update(request: Request): Promise<{ user: User }> {
    const error = HttpErrorFactory.simple('.update', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          email: {
            __type: 'string',
            __required: false,
          },
          password: {
            __type: 'object',
            __required: false,
            __child: {
              current: {
                __type: 'string',
                __required: true,
              },
              new: {
                __type: 'string',
                __required: true,
              },
            },
          },
          customPool: {
            __type: 'object',
            __required: false,
            __child: {
              personal: {
                __type: 'object',
                __required: false,
                __child: {
                  firstName: {
                    __type: 'string',
                    __required: false,
                  },
                  lastName: {
                    __type: 'string',
                    __required: false,
                  },
                  avatarUri: {
                    __type: 'string',
                    __required: false,
                  },
                },
              },
              address: {
                __type: 'object',
                __required: false,
                __child: {
                  country: {
                    __type: 'string',
                    __required: false,
                  },
                  city: {
                    __type: 'string',
                    __required: false,
                  },
                  state: {
                    __type: 'string',
                    __required: false,
                  },
                  zip: {
                    __type: 'string',
                    __required: false,
                  },
                  street: {
                    __type: 'object',
                    __required: false,
                    __child: {
                      name: {
                        __type: 'string',
                        __required: true,
                      },
                      number: {
                        __type: 'string',
                        __required: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const user = await this.userService.findById(jwt.payload.userId);
    if (user === null) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to find a User in database.',
      );
    }
    let changeDetected: boolean = false;
    if (request.body.email) {
      const userWithThisEmail = await this.userService.findByEmail(
        request.body.email,
      );
      if (userWithThisEmail !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `User with email '${request.body.email}' already exist.`,
        );
      }
      user.email = request.body.email;
      changeDetected = true;
    }
    if (request.body.password) {
      // const checkPassword = await bcrypt.hash(
      //   request.body.password.current,
      //   10,
      // );
      const checkPassword = await bcrypt.compare(
        request.body.password.current,
        user.password,
      );
      if (checkPassword === false) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'Incorrect current password has been provided.',
        );
      }
      user.password = await bcrypt.hash(request.body.password.new, 10);
      changeDetected = true;
    }
    if (request.body.personal) {
      if (request.body.personal.firstName) {
        user.customPool.personal.firstName = request.body.personal.firstName;
        user.username =
          user.customPool.personal.firstName +
          ' ' +
          user.customPool.personal.lastName;
        changeDetected = true;
      }
      if (request.body.personal.lastName) {
        user.customPool.personal.lastName = request.body.personal.lastName;
        user.username =
          user.customPool.personal.firstName +
          ' ' +
          user.customPool.personal.lastName;
        changeDetected = true;
      }
      if (request.body.personal.avatarUri) {
        user.customPool.personal.avatarUri = request.body.personal.avatarUri;
        changeDetected = true;
      }
    }
    if (request.body.address) {
      if (request.body.address.country) {
        user.customPool.address.country = request.body.address.country;
        changeDetected = true;
      }
      if (request.body.address.city) {
        user.customPool.address.city = request.body.address.city;
        changeDetected = true;
      }
      if (request.body.address.state) {
        user.customPool.address.state = request.body.address.state;
        changeDetected = true;
      }
      if (request.body.address.zip) {
        user.customPool.address.zip = request.body.address.zip;
        changeDetected = true;
      }
      if (request.body.address.street) {
        user.customPool.address.street.name = request.body.address.street.name;
        user.customPool.address.street.number =
          request.body.address.street.number;
        changeDetected = true;
      }
    }
    if (changeDetected === false) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Nothing to update.');
    }
    const updateUserResult = await this.userService.updateNew(user);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update a User in database.',
      );
    }
    return {
      user: UserFactory.removeProtected(user),
    };
  }

  @Post()
  async add(request: Request): Promise<{ user: User }> {
    const error = HttpErrorFactory.simple('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          email: {
            __type: 'string',
            __required: true,
          },
          password: {
            __type: 'string',
            __required: true,
          },
          customPool: {
            __type: 'object',
            __required: true,
            __child: {
              personal: {
                __type: 'object',
                __required: true,
                __child: {
                  firstName: {
                    __type: 'string',
                    __required: true,
                  },
                  lastName: {
                    __type: 'string',
                    __required: true,
                  },
                },
              },
            },
          },
        },
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const userWithSameEmail = await this.userService.findByEmail(
      request.body.email,
    );
    if (userWithSameEmail !== null) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `User with email '${request.body.email}' already exist.`,
      );
    }
    if (request.body.email.split('@').length !== 2) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid Email format for '${request.body.email}'`,
      );
    }
    const user = UserFactory.user({
      username:
        request.body.customPool.personal.firstName +
        ' ' +
        request.body.customPool.personal.lastName,
      email: request.body.email,
      firstName: request.body.customPool.personal.firstName,
      lastName: request.body.customPool.personal.lastName,
    });
    if (request.body.password.replace(/ /g, '') === '') {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        'Password cannot be empty string.',
      );
    }
    user.password = await bcrypt.hash(request.body.password, 10);
    const addUserResult = await this.userService.add(user);
    if (addUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add User to database.',
      );
    }
    return {
      user: UserFactory.removeProtected(user),
    };
  }

  @Post('/gen_admin_sec_code')
  async genAdminSecCode(request: Request) {
    SecurityCodeBufferService.gen();
    return {
      message: 'Success.',
    };
  }

  @Post('/create_admin')
  async createAdmin(
    request: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const error = HttpErrorFactory.simple('.createAdmin', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          securityCode: {
            __type: 'string',
            __required: true,
          },
          email: {
            __type: 'string',
            __required: true,
          },
          password: {
            __type: 'string',
            __required: true,
          },
          customPool: {
            __type: 'object',
            __required: true,
            __child: {
              personal: {
                __type: 'object',
                __required: true,
                __child: {
                  firstName: {
                    __type: 'string',
                    __required: true,
                  },
                  lastName: {
                    __type: 'string',
                    __required: true,
                  },
                },
              },
            },
          },
        },
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    if (
      SecurityCodeBufferService.compare(request.body.securityCode) === false
    ) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, 'Invalid security code.');
    }
    const userWithSameEmail = await this.userService.findByEmail(
      request.body.email,
    );
    if (userWithSameEmail !== null) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `User with email '${request.body.email}' already exist.`,
      );
    }
    const user = UserFactory.admin({
      username:
        request.body.customPool.personal.firstName +
        ' ' +
        request.body.customPool.personal.lastName,
      email: request.body.email,
      firstName: request.body.customPool.personal.firstName,
      lastName: request.body.customPool.personal.lastName,
    });
    const refreshToken = RefreshTokenFactory.instance;
    user.refreshTokens.push(refreshToken);
    user.password = await bcrypt.hash(request.body.password, 10);
    const addUserResult = await this.userService.add(user);
    if (addUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add User to database.',
      );
    }
    return {
      accessToken: JWTEncoding.encode(
        JWTSecurity.createToken(
          user._id.toHexString(),
          user.roles,
          JWTConfigService.get('user-token-config'),
          user.customPool,
        ),
      ),
      refreshToken: refreshToken.value,
    };
  }

  @Put()
  async updateUser(request: Request): Promise<{ user: User }> {
    const error = HttpErrorFactory.simple('updateUser', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          _id: {
            __type: 'string',
            __required: true,
          },
          email: {
            __type: 'string',
            __required: false,
          },
          password: {
            __type: 'string',
            __required: false,
          },
          customPool: {
            __type: 'object',
            __required: false,
            __child: {
              personal: {
                __type: 'object',
                __required: false,
                __child: {
                  firstName: {
                    __type: 'string',
                    __required: false,
                  },
                  lastName: {
                    __type: 'string',
                    __required: false,
                  },
                },
              },
              policy: {
                __type: 'object',
                __require: true,
                __child: {
                  media: {
                    __type: 'object',
                    __required: true,
                    __child: {
                      get: {
                        __type: 'boolean',
                        __required: true,
                      },
                      post: {
                        __type: 'boolean',
                        __required: true,
                      },
                      put: {
                        __type: 'boolean',
                        __required: true,
                      },
                      delete: {
                        __type: 'boolean',
                        __required: true,
                      },
                    },
                  },
                  templates: {
                    __type: 'array',
                    __required: true,
                    __child: {
                      __type: 'object',
                      __content: {
                        get: {
                          __type: 'boolean',
                          __required: true,
                        },
                        post: {
                          __type: 'boolean',
                          __required: true,
                        },
                        put: {
                          __type: 'boolean',
                          __required: true,
                        },
                        delete: {
                          __type: 'boolean',
                          __required: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    if (StringUtility.isIdValid(request.body._id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.body._id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const user = await this.userService.findById(request.body._id);
    user.customPool.policy = request.body.customPool.policy;
    if (user === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `User with ID '${request.body._id}' does not exist.`,
      );
    }
    if (
      typeof request.body.email !== 'undefined' &&
      request.body.email !== user.email
    ) {
      if (request.body.email.split('@').length !== 2) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `Invalid Email format for '${request.body.email}'`,
        );
      }
      const userWithSameEmail = await this.userService.findByEmail(
        request.body.email,
      );
      if (userWithSameEmail !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `User with Email '${request.body.email}' already exist.`,
        );
      }
      user.email = request.body.email;
    }
    if (typeof request.body.password !== 'undefined') {
      if (request.body.password.replace(/ /g, '') === '') {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'Password cannot be empty string.',
        );
      }
      user.password = await bcrypt.hash(request.body.password, 10);
    }
    if (
      typeof request.body.customPool !== 'undefined' &&
      typeof request.body.customPool.personal !== 'undefined'
    ) {
      if (typeof request.body.customPool.personal.firstName !== 'undefined') {
        user.customPool.personal.firstName =
          request.body.customPool.personal.firstName;
        user.username = `${user.customPool.personal.firstName} ${user.customPool.personal.lastName}`;
      }
      if (typeof request.body.customPool.personal.lastName !== 'undefined') {
        user.customPool.personal.lastName =
          request.body.customPool.personal.lastName;
        user.username = `${user.customPool.personal.firstName} ${user.customPool.personal.lastName}`;
      }
    }
    const updateUserResult = await this.userService.updateNew(user);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update User in database.',
      );
    }
    return {
      user: UserFactory.removeProtected(user),
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    const error = HttpErrorFactory.simple('deleteById', this.logger);
    if (StringUtility.isIdValid(request.params.id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.params.id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.DELETE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    if (jwt.payload.userId === request.params.id) {
      throw error.occurred(HttpStatus.FORBIDDEN, `You cannot delete yourself.`);
    }
    const user = await this.userService.findById(request.params.id);
    if (user === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `User with ID '${request.params.id}' does not exist.`,
      );
    }
    const deleteUserResult = await this.userService.deleteById(
      request.params.id,
    );
    if (deleteUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to remove User from database.`,
      );
    }
    return {
      message: 'Success.',
    };
  }
}
