import * as crypto from 'crypto';
import { RefreshToken } from '../interfaces/refresh-token.interface';

export class RefreshTokenFactory {
  private static readonly EXP_IN: number = 2592000000;
  public static get instance(): RefreshToken {
    return {
      value: crypto.randomBytes(128).toString('hex'),
      expAt: Date.now() + RefreshTokenFactory.EXP_IN,
    };
  }
}
