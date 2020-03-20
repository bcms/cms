import * as crypto from 'crypto';
import { Key, KeyAccess } from '../models/key.model';
import { Types } from 'mongoose';

export class KeyFactory {
  public static instance(config: {
    userId: string;
    name: string;
    desc: string;
    blocked: boolean;
    access: KeyAccess;
  }): Key {
    return new Key(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      config.userId,
      config.name,
      config.desc,
      config.blocked,
      crypto.randomBytes(256).toString('base64').substring(32, 64),
      config.access,
    );
  }
}
