import { IEntity } from 'purple-cheetah';
import { Types, Schema } from 'mongoose';
import { Prop } from '../../prop/interfaces/prop.interface';

export interface EntryContent {
  lng: string;
  props: Prop[];
}

/**
 * @ignore
 */
export interface IEntry extends IEntity {
  templateId: string;
  userId: string;
  content: EntryContent[];
}

export class Entry {
  constructor(
    // tslint:disable-next-line:variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    /** Pointer to a Template from with this Entry was created. */
    public templateId: string,
    /** Pointer to a User that created this Entry. */
    public userId: string,
    /** Content of an Entry. */
    public content: EntryContent[],
  ) {}

  /** Provides schema object for Mongoose Repository. */
  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      templateId: String,
      userId: String,
      content: [Object],
    });
  }
}
