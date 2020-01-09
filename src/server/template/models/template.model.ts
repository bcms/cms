import { IEntity } from 'purple-cheetah';
import { Types, Schema } from 'mongoose';
import { Prop } from '../../prop/interfaces/prop.interface';

export enum TemplateType {
  RICH_CONTENT = 'RICH_CONTENT',
  DATA_MODEL = 'DATA_MODEL',
}

/**
 * @ignore
 */
export interface ITemplate extends IEntity {
  type: TemplateType;
  name: string;
  desc: string;
  userId: string;
  entryTemplate: Prop[];
  entryIds: string[];
}

/**
 * Template Object.
 */
export class Template {
  constructor(
    // tslint:disable-next-line:variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    public type: TemplateType,
    public name: string,
    public desc: string,
    /** Who created a Template. */
    public userId: string,
    /** Holds template for how a new Entry should be created. */
    public entryTemplate: Prop[],
    /** Pointers to the Entries created using this Template. */
    public entryIds: string[],
  ) {}

  /** Provides schema object for Mongoose Repository. */
  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      type: String,
      name: String,
      desc: String,
      userId: String,
      entryTemplate: [Object],
      entryIds: [String],
    });
  }
}
