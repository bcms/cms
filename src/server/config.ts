import * as path from 'path';
import { JWTConfigService, JWTEncryptionAlg } from 'purple-cheetah';
import { KeyCashService } from './api/key-cash.service';
import { FunctionsConfig } from './function/config';


export class Config {
  public static async init() {
    if (!process.env.PROJECT_ROOT) {
      process.env.PROJECT_ROOT = path.join(__dirname, '..');
    }
    JWTConfigService.add({
      id: 'user-token-config',
      alg: JWTEncryptionAlg.HMACSHA256,
      expIn: 300000,
      issuer: process.env.USER_TOKEN_ISSUER,
      secret: process.env.USER_TOKEN_SECRET,
    });
    await KeyCashService.init();
    await FunctionsConfig.init();
  }
}
