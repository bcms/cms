import type { SendFunction } from '../main';
import type { BCMSEntity } from '../models';

export interface BCMSDefaultHandlerCache<Model extends BCMSEntity> {
  findAll(): Model[];
  findOne(query: (item: Model) => boolean): Model | undefined;
  find(query: (item: Model) => boolean): Model[];
  set(item: Model | Model[]): void;
  remove(item: Model | Model[]): void;
}

export interface BCMSDefaultHandlerConfig<Model extends BCMSEntity> {
  baseUri: string;
  send: SendFunction;
  cache: BCMSDefaultHandlerCache<Model>;
}

export interface BCMSDefaultHandler<
  Model extends BCMSEntity & { cid?: string },
  AddData,
  UpdateData,
> {
  get(id: string, skipCache?: boolean): Promise<Model>;
  getAll(): Promise<Model[]>;
  getMany(ids: string[], skipCache?: boolean): Promise<Model[]>;
  create(data: AddData): Promise<Model>;
  update(data: UpdateData): Promise<Model>;
  deleteById(id: string): Promise<string>;
  count(): Promise<number>;
}
