import type { BCMSSdkCache } from '../cache';
import type { SendFunction } from '../main';
import type { BCMSMedia } from '../models';
import type { BCMSStorage } from '../storage';
import type { BCMSStringUtility } from '../util';

export interface BCMSMediaHandlerConfig {
  send: SendFunction;
  cache: BCMSSdkCache;
  isLoggedIn(): Promise<boolean>;
  storage: BCMSStorage;
  stringUtil: BCMSStringUtility;
}

export interface BCMSMediaHandler {
  getAll(): Promise<BCMSMedia[]>;
  getAllByParentId(id: string, skipCache?: boolean): Promise<BCMSMedia[]>;
  getMany(ids: string[], skipCache?: boolean): Promise<BCMSMedia[]>;
  getById(id: string, skipCache?: boolean): Promise<BCMSMedia>;
  getBinary(id: string, size?: 'small'): Promise<Buffer>;
  getVideoThumbnail(id: string): Promise<Buffer | null>;
  requestUploadToken(): Promise<string>;
  createFile(data: {
    file: File | Buffer;
    fileName?: string;
    parentId?: string;
    onProgress?(event: unknown): void;
  }): Promise<BCMSMedia>;
  createDir(data: { name: string; parentId?: string }): Promise<BCMSMedia>;
  updateFile(data: {
    _id: string;
    altText?: string;
    caption?: string;
    name?: string;
  }): Promise<BCMSMedia>;
  deleteById(id: string): Promise<void>;
  count(): Promise<number>;
  duplicateFile(data: { _id: string; duplicateTo: string }): Promise<BCMSMedia>;
  moveFile(data: { _id: string; moveTo: string }): Promise<BCMSMedia>;
}
