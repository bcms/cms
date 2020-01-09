import { IEntity } from 'purple-cheetah';
import { Prop } from '../../prop/interfaces/prop.interface';
import { Types, Schema } from 'mongoose';

/** @ignore */
export interface IGroup extends IEntity {
  name: string;
  desc: string;
  props: Prop[];
}

export class Group {
  constructor(
    // tslint:disable-next-line: variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public name: string,
    public desc: string,
    public props: Prop[],
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      name: String,
      desc: String,
      props: [Object],
    });
  }
}
