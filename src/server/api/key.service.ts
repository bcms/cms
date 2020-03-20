import { IMongooseEntityService, MongooseEntityService, Logger } from 'purple-cheetah';
import { IKey, Key } from './models/key.model';
import { Model } from 'mongoose';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_keys`,
  },
  entity: {
    schema: Key.schema,
    convertInterfaceToClassFunction: (e: IKey): Key => {
      return e;
    },
  },
})
export class KeyService implements IMongooseEntityService<Key> {
  private repo: Model<IKey>;
  private logger: Logger;
  findAll: () => Promise<Key[]>;
  findAllById: (ids: string[]) => Promise<Key[]>;
  findById: (id: string) => Promise<Key>;
  add: (e: Key) => Promise<boolean>;
  update: (e: Key) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async updateNew(e: Key): Promise<boolean> {
    e.updatedAt = Date.now();
    try {
      e.updatedAt = Date.now();
      await this.repo.updateOne({ _id: e._id.toHexString() }, e);
      return true;
    } catch (error) {
      this.logger.error('.update', {
        errorMessage: error.message,
        stack: error.stack,
      });
      return false;
    }
  }
}
