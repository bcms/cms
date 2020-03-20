import {
  AppLogger,
  Logger,
  HttpErrorFactory,
  JWTEncoding,
  HttpStatus,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  StringUtility,
  ObjectUtility,
} from 'purple-cheetah';
import { Key, KeyAccess } from './models/key.model';
import { KeyCashService } from './key-cash.service';
import { KeyFactory } from './factories/key.factory';
import { APISecurity } from './api-security';

export class KeyHandler {
  @AppLogger(KeyHandler)
  private static logger: Logger;

  public static getAccessList(
    method: string,
    url: string,
    body: any,
    signature: {
      key: string;
      nonce: string;
      timestamp: number;
      signature: string;
    },
  ): {
    access: KeyAccess;
  } {
    const error = HttpErrorFactory.simple('getAccessList', this.logger);
    try {
      APISecurity.verify(signature, body, method.toUpperCase(), url, true);
    } catch (e) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, e.message);
    }
    const key = KeyCashService.findById(signature.key);
    return {
      access: key.access,
    };
  }

  public static async getAll(authorization: string): Promise<{ keys: Key[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    const jwt = JWTEncoding.decode(authorization);
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
    return {
      keys: KeyCashService.findAll(),
    };
  }

  public static async getById(
    authorization: string,
    id: string,
  ): Promise<{ key: Key }> {
    const error = HttpErrorFactory.simple('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(authorization);
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
    const key = KeyCashService.findById(id);
    if (key === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Key with ID '${id}' does not exist.`,
      );
    }
    return {
      key,
    };
  }

  public static async add(
    authorization: string,
    body: any,
  ): Promise<{ key: Key }> {
    const error = HttpErrorFactory.simple('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(body, Key.objectSchema, 'body');
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    const jwt = JWTEncoding.decode(authorization);
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
    const key = KeyFactory.instance({
      userId: jwt.payload.userId,
      name: body.name,
      desc: body.desc,
      blocked: body.blocked,
      access: body.access,
    });
    const addKeyResult = await KeyCashService.add(key);
    if (addKeyResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Key to database.',
      );
    }
    return {
      key,
    };
  }

  public static async update(
    authorization: string,
    body: any,
  ): Promise<{ key: Key }> {
    const error = HttpErrorFactory.simple('update', this.logger);
    try {
      const requestSchema = Key.objectSchema;
      requestSchema._id = {
        __type: 'string',
        __required: true,
      };
      ObjectUtility.compareWithSchema(body, requestSchema, 'body');
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    if (StringUtility.isIdValid(body._id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${body._id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(authorization);
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
    const key = KeyCashService.findById(body._id);
    if (key === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Key with ID '${body._id}' does not exist.`,
      );
    }
    key.name = body.name;
    key.desc = body.desc;
    key.blocked = body.blocked;
    key.access = body.access;
    const updateKeyResult = await KeyCashService.update(key);
    if (updateKeyResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update Key in database.',
      );
    }
    return {
      key,
    };
  }

  public static async deleteById(
    authorization: string,
    id: string,
  ): Promise<{ message: string }> {
    const error = HttpErrorFactory.simple('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(authorization);
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
    const key = KeyCashService.findById(id);
    if (key === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Key with ID '${id}' does not exist.`,
      );
    }
    const deleteKeyResult = await KeyCashService.deleteById(id);
    if (deleteKeyResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete Key from database.`,
      );
    }
    return {
      message: 'Success.',
    };
  }
}
