import { IMongooseEntityService, Entity } from 'purple-cheetah';

export abstract class Cache<T> {
  protected cache: Entity[] = [];

  constructor(protected service: IMongooseEntityService<T>) {
    service.findAll().then((result) => {
      this.cache = result as any;
    });
  }

  public async findAll(): Promise<T[]> {
    return JSON.parse(JSON.stringify(this.cache));
  }

  public async findAllById(ids: string[]): Promise<T[]> {
    return this.cache.filter((e) =>
      ids.find((t) => t === e._id.toHexString()),
    ) as any;
  }

  public async findById(id: string): Promise<T> {
    const result: T = this.cache.find(
      (e) => e._id && e._id.toHexString() === id,
    ) as any;
    return result ? result : null;
  }

  public async add(e: Entity) {
    const result = await this.service.add(e);
    if (result === false) {
      return false;
    }
    this.cache.push(e);
    return true;
  }

  public async update(e: Entity) {
    const result = await this.service.update(e);
    if (result === false) {
      return false;
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.cache.length; i = i + 1) {
      if (this.cache[i]._id.toHexString() === e._id.toHexString()) {
        this.cache[i] = (await this.service.findById(
          e._id.toHexString(),
        )) as any;
        return true;
      }
    }
    return false;
  }

  public async deleteById(id: string) {
    const result = await this.service.deleteById(id);
    if (result === false) {
      return false;
    }
    this.cache = this.cache.filter((e) => e._id.toHexString() !== id);
    return true;
  }
}
