import * as crypto from 'crypto';
import {
  Controller,
  AppLogger,
  Logger,
  Get,
  HttpErrorFactory,
  JWTEncoding,
  HttpStatus,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  StringUtility,
  Post,
  ObjectUtility,
  Put,
  Delete,
} from 'purple-cheetah';
import { Request } from 'express';
import { Key } from './models/key.model';
import { KeyCashService } from './key-cash.service';
import { KeyFactory } from './factories/key.factory';

/**
 * Controller that provides CRUD routed for Key object.
 */
@Controller('/key')
export class KeyController {
  @AppLogger(KeyController)
  private logger: Logger;

  /** Get all Keys. For this request to be successful User must have `ADMIN` Role. */
  @Get('/all')
  async getAll(request: Request): Promise<{ keys: Key[] }> {
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
    return {
      keys: KeyCashService.findAll(),
    };
  }

  /** Get a specific Key. For this request to be successful User must have `ADMIN` Role. */
  @Get('/:id')
  async getById(request: Request): Promise<{ key: Key }> {
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
    const key = KeyCashService.findById(request.params.id);
    if (key === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Key with ID '${request.params.id}' does not exist.`,
      );
    }
    return {
      key,
    };
  }

  /** Create new Key. For this request to be successful User must have `ADMIN` Role. */
  @Post()
  async add(request: Request): Promise<{ key: Key }> {
    const error = HttpErrorFactory.simple('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(request.body, Key.objectSchema, 'body');
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
    const key = KeyFactory.instance({
      userId: jwt.payload.userId,
      name: request.body.name,
      desc: request.body.desc,
      blocked: request.body.blocked,
      access: request.body.access,
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

  /** Update existing Key. For this request to be successful User must have `ADMIN` Role. */
  @Put()
  async update(request: Request): Promise<{ key: Key }> {
    const error = HttpErrorFactory.simple('update', this.logger);
    try {
      const requestSchema = Key.objectSchema;
      requestSchema._id = {
        __type: 'string',
        __required: true,
      };
      ObjectUtility.compareWithSchema(request.body, requestSchema, 'body');
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
    const key = KeyCashService.findById(request.body._id);
    if (key === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Key with ID '${request.body._id}' does not exist.`,
      );
    }
    key.name = request.body.name;
    key.desc = request.body.desc;
    key.blocked = request.body.blocked;
    key.access = request.body.access;
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

  /** Delete specific Key. For this request to be successful User must have `ADMIN` Role. */
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
    const key = KeyCashService.findById(request.params.id);
    if (key === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Key with ID '${request.params.id}' does not exist.`,
      );
    }
    const deleteKeyResult = await KeyCashService.deleteById(request.params.id);
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
