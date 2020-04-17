import { Template, TemplateType } from '../models/template.model';
import { Types } from 'mongoose';

export class TemplateFactory {
  public static get instance(): Template {
    return new Template(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      TemplateType.DATA_MODEL,
      '',
      '',
      '',
      [],
      [],
      {
        title: '',
        coverImageUri: '',
      },
    );
  }
}
