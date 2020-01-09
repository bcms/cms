import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Entry, IEntry } from './models/entry.model';
import { Model } from 'mongoose';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_entries`,
  },
  entity: {
    schema: Entry.schema,
    convertInterfaceToClassFunction: (e: IEntry): Entry => {
      return e;
    },
  },
})
export class EntryService implements IMongooseEntityService<Entry> {
  private repo: Model<IEntry>;
  findAll: () => Promise<Entry[]>;
  findAllById: (ids: string[]) => Promise<Entry[]>;
  findById: (id: string) => Promise<Entry>;
  add: (e: Entry) => Promise<boolean>;
  update: (e: Entry) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findAllByTemplateId(templateId): Promise<Entry[]> {
    return await this.repo.find({ templateId });
  }

  async findByTemplateIdAndEntrySlug(templateId: string, entrySlug: string) {
    return await this.repo.findOne({
      templateId,
      'content.props.value.heading.slug': entrySlug,
    });
  }

  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }
}
