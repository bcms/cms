import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Language, ILanguage } from './models/language.model';
import { Model } from 'mongoose';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_languages`,
  },
  entity: {
    schema: Language.schema,
    convertInterfaceToClassFunction: (e: ILanguage): Language => {
      return e;
    },
  },
})
export class LanguageService implements IMongooseEntityService<Language> {
  private repo: Model<ILanguage>;

  findAll: () => Promise<Language[]>;
  findAllById: (ids: string[]) => Promise<Language[]>;
  findById: (id: string) => Promise<Language>;
  add: (e: Language) => Promise<boolean>;
  update: (e: Language) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByCode(code: string): Promise<Language | null> {
    return await this.repo.findOne({ code });
  }
}
