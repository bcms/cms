import { IEntity } from 'purple-cheetah';
import { Types, Schema } from 'mongoose';

/** @ignore */
export interface ILanguage extends IEntity {
  userId: string;
  code: string;
  name: string;
  nativeName: string;
}

export class Language {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public userId: string,
    public code: string,
    public name: string,
    public nativeName: string,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      userId: String,
      code: String,
      name: String,
      nativeName: String,
    });
  }
}
