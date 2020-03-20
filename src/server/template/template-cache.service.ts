import { Service } from 'purple-cheetah';
import { TemplateService } from './template.service';
import { Template } from './models/template.model';
import { Types } from 'mongoose';

export class TemplateCacheService {
  @Service(TemplateService)
  private static service: TemplateService;
  private static entities: Template[];

  /** Pulls all Templates from database and stores them in memory. */
  public static async init() {
    this.entities = await this.service.findAll();
  }

  /** Returns all Templates from the cache. */
  public static findAll(): Template[] {
    return JSON.parse(JSON.stringify(this.entities));
  }

  /** Returns a single Template from the cache. */
  // tslint:disable-next-line:variable-name
  public static findById(_id: string): Template | null {
    const entity = this.entities.find(e => e._id.toHexString() === _id);
    return entity ? entity : null;
  }

  /** Adds a Template to the cache and to the database. */
  public static async add(entity: Template): Promise<boolean> {
    entity._id = new Types.ObjectId();
    entity.createdAt = Date.now();
    entity.updatedAt = Date.now();
    const result = await this.service.add(entity);
    if (result === false) {
      return false;
    }
    this.entities.push(entity);
    return true;
  }

  /** Updates a Template in the cache and the database. */
  public static async update(entity: Template): Promise<boolean> {
    const result = await this.service.update(entity);
    if (result === false) {
      return false;
    }
    this.entities.forEach(e => {
      if (e._id.toHexString() === entity._id.toHexString()) {
        e = JSON.parse(JSON.stringify(entity));
      }
    });
    return true;
  }

  /** Removes a Template from the cache and the database. */
  // tslint:disable-next-line:variable-name
  public static async deleteById(_id: string): Promise<boolean> {
    const result = await this.service.deleteById(_id);
    if (result === false) {
      return false;
    }
    this.entities = this.entities.filter(e => e._id.toHexString() !== _id);
    return true;
  }
}
