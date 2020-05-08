import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Media, IMedia, MediaType } from './models/media.model';
import { Model } from 'mongoose';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_media`,
  },
  entity: {
    schema: Media.schema,
    convertInterfaceToClassFunction: (e: IMedia): Media => {
      return e;
    },
  },
})
export class MediaService implements IMongooseEntityService<Media> {
  private repo: Model<IMedia>;
  findAll: () => Promise<Media[]>;
  findAllById: (ids: string[]) => Promise<Media[]>;
  findById: (id: string) => Promise<Media>;
  add: (e: Media) => Promise<boolean>;
  update: (e: Media) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByPath(path: string): Promise<Media | null> {
    return await this.repo.findOne({ path });
  }

  async findByPathAndType(
    path: string,
    type: MediaType,
  ): Promise<Media | null> {
    return await this.repo.findOne({ path, type });
  }

  async findByNameAndPath(name: string, path: string): Promise<Media | null> {
    return await this.repo.findOne({ name, path });
  }

  async findByIsInRoot(isInRoot: boolean): Promise<Media[]> {
    return this.repo.find({ isInRoot });
  }
}
