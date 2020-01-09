import { Group } from '../models/group.modal';
import { Types } from 'mongoose';

export class GroupFactory {
  public static get instance(): Group {
    return new Group(new Types.ObjectId(), Date.now(), Date.now(), '', '', []);
  }
}
