import { Types } from 'mongoose';
import { TemplateType } from '../models/template.model';

export interface TemplateLite {
  _id: Types.ObjectId;
  createdAt: number;
  updatedAt: number;
  type: TemplateType;
  name: string;
  userId: string;
  entryIds: string[];
}
