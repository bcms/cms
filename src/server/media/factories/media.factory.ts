import { Media, MediaType } from '../models/media.model';
import { Types } from 'mongoose';

export class MediaFactory {
  public static get instance() {
    return new Media(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      '',
      MediaType.DIR,
      '',
      0,
      '',
      '/',
      true,
      [],
    );
  }
}
