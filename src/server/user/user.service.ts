import {
  IMongooseEntityService,
  MongooseEntityService,
  ObjectUtility,
  Logger,
} from 'purple-cheetah';
import { User, IUser } from './models/user.model';
import { UserFactory } from './factories/user.factory';
import { Model } from 'mongoose';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_users`,
  },
  entity: {
    schema: User.schema,
    convertInterfaceToClassFunction: (e: IUser) => {
      return ObjectUtility.merge(UserFactory.instance, e);
    },
  },
})
export class UserService implements IMongooseEntityService<User> {
  private repo: Model<IUser>;
  private logger: Logger;

  findAll: () => Promise<User[]>;
  findAllById: (ids: string[]) => Promise<User[]>;
  findById: (id: string) => Promise<User>;
  add: (e: User) => Promise<boolean>;
  update: (e: User) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async updateNew(e: User): Promise<boolean> {
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

  async findAllByCompanyId(companyId: string): Promise<User[]> {
    const entities = await this.repo.find({
      'customPool.company.id': companyId,
    });
    const userTemplate = UserFactory.instance;
    return entities.map(e => {
      return ObjectUtility.merge(userTemplate, e);
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ email });
    return entity === null
      ? null
      : ObjectUtility.merge(UserFactory.instance, entity);
  }

  async findByRefreshTokenValue(value: string): Promise<User | null> {
    return await this.repo.findOne({ 'refreshTokens.value': value });
  }

  async findAllByLimitAndOffset(
    limit: number,
    offset: number,
  ): Promise<User[]> {
    const entities = await this.repo
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    return entities.map(e => {
      return ObjectUtility.merge(UserFactory.instance, e);
    });
  }

  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }
}
