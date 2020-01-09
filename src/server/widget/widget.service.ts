import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Model } from 'mongoose';
import { Widget, IWidget } from './models/widget.model';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_widgets`,
  },
  entity: {
    schema: Widget.schema,
    convertInterfaceToClassFunction: (e: IWidget): Widget => {
      return e;
    },
  },
})
export class WidgetService implements IMongooseEntityService<Widget> {
  private repo: Model<IWidget>;

  findAll: () => Promise<Widget[]>;
  findAllById: (ids: string[]) => Promise<Widget[]>;
  findById: (id: string) => Promise<Widget>;
  add: (e: Widget) => Promise<boolean>;
  update: (e: Widget) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByName(name: string): Promise<Widget | null> {
    return await this.repo.findOne({ name });
  }
}
