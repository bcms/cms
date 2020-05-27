import { Entry } from '../models/entry.model';
import { Types } from 'mongoose';
import { PropType, PropQuill } from '../../prop';

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

  public static toLite(entry: Entry): Entry {
    const result: Entry = JSON.parse(JSON.stringify(entry));
    result.content.forEach((e) => {
      e.props = e.props
        .filter((t) => t.type === PropType.QUILL)
        .map((t) => {
          if (t.type === PropType.QUILL) {
            t.value = t.value as PropQuill;
            t.value.content = [];
          }
          return t;
        });
    });
    return result;
  }
}
