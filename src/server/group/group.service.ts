import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Group, IGroup } from './models/group.modal';
import { Model } from 'mongoose';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_groups`,
  },
  entity: {
    schema: Group.schema,
    convertInterfaceToClassFunction: (e: IGroup): Group => {
      return e;
    },
  },
})
export class GroupService implements IMongooseEntityService<Group> {
  private repo: Model<IGroup>;

  findAll: () => Promise<Group[]>;
  findAllById: (ids: string[]) => Promise<Group[]>;
  findById: (id: string) => Promise<Group>;
  add: (e: Group) => Promise<boolean>;
  update: (e: Group) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByName(name: string): Promise<Group | null> {
    return await this.repo.findOne({ name });
  }
}
