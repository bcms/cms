import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Template, ITemplate } from './models/template.model';
import { Model } from 'mongoose';
import { TemplateLite } from './interfaces/template-lite.interface';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_templates`,
  },
  entity: {
    schema: Template.schema,
    convertInterfaceToClassFunction: (e: ITemplate): Template => {
      return e;
    },
  },
})
export class TemplateService implements IMongooseEntityService<Template> {
  private repo: Model<ITemplate>;

  findAll: () => Promise<Template[]>;
  findAllById: (ids: string[]) => Promise<Template[]>;
  findById: (id: string) => Promise<Template>;
  add: (e: Template) => Promise<boolean>;
  update: (e: Template) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findAllLite(): Promise<TemplateLite[]> {
    return await this.repo.find().select({
      _id: 1,
      createdAt: 1,
      updatedAt: 1,
      type: 1,
      name: 1,
      userId: 1,
      entryIds: 1,
    });
  }

  async findAllLiteById(ids: string[]): Promise<TemplateLite[]> {
    return await this.repo.find({ _id: { $in: ids } }).select({
      _id: 1,
      createdAt: 1,
      updatedAt: 1,
      type: 1,
      name: 1,
      userId: 1,
      entryIds: 1,
    });
  }

  async findByName(name: string): Promise<Template | null> {
    return await this.repo.findOne({ name });
  }
}
