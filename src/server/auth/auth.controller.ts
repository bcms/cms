import * as bcrypt from 'bcrypt';
import {
  Controller,
  AppLogger,
  Logger,
  Service,
  Post,
  HttpErrorFactory,
  HttpStatus,
  JWTEncoding,
  JWTSecurity,
  JWTConfigService,
} from 'purple-cheetah';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { RefreshTokenFactory } from '../user/factories/refresh-token.factory';

@Controller('/auth')
export class AuthController {
  @AppLogger(AuthController)
  private logger: Logger;
  @Service(UserService)
  private userService: UserService;

  @Post('/user')
  public async getTokens(
    request: Request,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const error = HttpErrorFactory.simple('.getTokens', this.logger);
    if (!request.headers.authorization) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Missing header `authorization`.',
      );
    }
    const auth = {
      email: '',
      password: '',
    };
    try {
      const parts = Buffer.from(
        request.headers.authorization.replace('Basic ', ''),
        'base64',
      )
        .toString()
        .split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid length.');
      }
      auth.email = parts[0];
      auth.password = parts[1];
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Bad header `authorization` encoding.',
      );
    }
    const user = await this.userService.findByEmail(auth.email);
    if (user === null) {
      const e = error.occurred(
        HttpStatus.UNAUTHORIZED,
        'Bad email and/or password.',
      );
      e.stack = {
        message: `Bad email: ${auth.email}`,
      };
      throw e;
    }
    const checkPassword = await bcrypt.compare(auth.password, user.password);
    if (checkPassword === false) {
      const e = error.occurred(
        HttpStatus.UNAUTHORIZED,
        'Bad email and/or password.',
      );
      e.stack = {
        message: `Bad password: ${auth.password}`,
      };
      throw e;
    }
    const refreshToken = RefreshTokenFactory.instance;
    user.refreshTokens.push(refreshToken);
    const updateUserResult = await this.userService.update(user);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update User in database.',
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

  @Post('/token/refresh')
  public async refreshToken(
    request: Request,
  ): Promise<{ accessToken: string }> {
    const error = HttpErrorFactory.simple('.refreshToken', this.logger);
    if (!request.headers.authorization) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        'Missing header `authorization`.',
      );
    }
    const user = await this.userService.findByRefreshTokenValue(
      request.headers.authorization.replace('Bearer ', ''),
    );
    if (user === null) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, 'Bad refresh token.');
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
    };
  }
}
