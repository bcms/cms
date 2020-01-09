import { Language } from '../models/language.model';
import { Types } from 'mongoose';

export class LanguageFactory {
  public static get instance(): Language {
    return new Language(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      '',
      '',
      '',
      '',
    );
  }
}
