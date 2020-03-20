import { Types } from 'mongoose';
import { Widget } from '../models/widget.model';

export class WidgetFactory {
  public static get instance(): Widget {
    return new Widget(new Types.ObjectId(), Date.now(), Date.now(), '', '', []);
  }
}
