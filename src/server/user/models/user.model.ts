import { IEntity, Role } from 'purple-cheetah';
import { RefreshToken } from '../interfaces/refresh-token.interface';
import { CustomPool } from '../interfaces/custom-pool.interface';
import { Types, Schema } from 'mongoose';

export interface IUser extends IEntity {
  username: string;
  email: string;
  password: string;
  roles: Role[];
  refreshTokens: RefreshToken[];
  customPool: CustomPool;
}

export class User {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public username: string,
    public email: string,
    public password: string,
    public roles: Role[],
    public refreshTokens: RefreshToken[],
    public customPool: CustomPool,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      username: String,
      email: String,
      password: String,
      roles: [Object],
      refreshTokens: [Object],
      customPool: Object,
    });
  }
}
