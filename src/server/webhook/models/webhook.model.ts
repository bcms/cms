import { IEntity } from 'purple-cheetah';
import { Types, Schema } from 'mongoose';

export interface IWebhook extends IEntity {
  name: string;
  desc: string;
  body: string;
}

export class Webhook {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public desc: string,
    public body: string,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      name: String,
      desc: String,
      body: String,
    });
  }
}
