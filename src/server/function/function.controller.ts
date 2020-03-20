import {
  Controller,
  AppLogger,
  Logger,
  Post,
  HttpErrorFactory,
  HttpStatus,
  JWTEncoding,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  Get,
} from 'purple-cheetah';
import { FunctionsConfig } from './config';
import { Request } from 'express';
import { APISecurity } from '../api/api-security';

@Controller('/function')
export class FunctionController {
  @AppLogger(FunctionController)
  private logger: Logger;

  @Get('/all/available')
  async getAllAvailable(request: Request): Promise<{ functions: string[] }> {
    const error = HttpErrorFactory.simple('execute', this.logger);
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.EXECUTE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    return {
      functions: FunctionsConfig.functions.map(e => {
        return e.name;
      }),
    };
  }

  @Post('/:name')
  async execute(request: Request): Promise<any> {
    const error = HttpErrorFactory.simple('execute', this.logger);
    const fn = FunctionsConfig.functions.find(
      f => f.name === request.params.name,
    );
    if (!fn) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Function with name '${request.params.name}' does not exist.`,
      );
    }
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
        );
      } catch (e) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, e.message);
      }
    } else {
      const jwt = JWTEncoding.decode(request.headers.authorization);
      if (jwt instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
      } else {
        const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
          jwt,
          [RoleName.ADMIN, RoleName.USER],
          PermissionName.EXECUTE,
          JWTConfigService.get('user-token-config'),
        );
        if (jwtValid instanceof Error) {
          throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
        }
      }
    }
    let fnResult;
    try {
      fnResult = await fn.resolve(request);
    } catch (e) {
      this.logger.error('.execute', e);
      throw error.occurred(HttpStatus.INTERNAL_SERVER_ERROR, {
        success: false,
        message: 'Failed to execute a function.',
        err: e.message,
      });
    }
    return {
      success: true,
      result: fnResult,
    };
  }
}
