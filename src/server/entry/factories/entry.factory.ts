import { Entry } from '../models/entry.model';
import { Types } from 'mongoose';
import { ObjectUtility } from 'purple-cheetah';

export class EntryFactory {
  public static get instance(): Entry {
    return new Entry(new Types.ObjectId(), Date.now(), Date.now(), '', '', []);
  }
  
  public static objectToEntry(object: any): Entry {
    const entry = new Entry(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      '',
      '',
      [],
    );
    return entry;
  }
}
