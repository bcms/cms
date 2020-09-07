import { Controller, Get, Post, Put, Delete } from 'purple-cheetah';
import { Request } from 'express';
import { Key, KeyAccess } from './models/key.model';
import { KeyHandler } from './key.handler';

/**
 * Controller that provides CRUD routed for Key object.
 */
@Controller('/key')
export class KeyController {
  /** Get Key access list. API Key authorization is required. */
  @Get('/access/list')
  async getAccessList(request: Request): Promise<{ access: KeyAccess }> {
    return KeyHandler.getAccessList(
      request.method,
      request.originalUrl,
      request.body,
      request.query as any,
    );
  }

  /** Get all Keys. For this request to be successful User must have `ADMIN` Role. */
  @Get('/all')
  async getAll(request: Request): Promise<{ keys: Key[] }> {
    return await KeyHandler.getAll(request.headers.authorization);
  }

  /** Get a specific Key. For this request to be successful User must have `ADMIN` Role. */
  @Get('/:id')
  async getById(request: Request): Promise<{ key: Key }> {
    return await KeyHandler.getById(
      request.headers.authorization,
      request.params.id,
    );
  }

  /** Create new Key. For this request to be successful User must have `ADMIN` Role. */
  @Post()
  async add(request: Request): Promise<{ key: Key }> {
    return await KeyHandler.add(request.headers.authorization, request.body);
  }

  /** Update existing Key. For this request to be successful User must have `ADMIN` Role. */
  @Put()
  async update(request: Request): Promise<{ key: Key }> {
    return await KeyHandler.update(request.headers.authorization, request.body);
  }

  /** Delete specific Key. For this request to be successful User must have `ADMIN` Role. */
  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    return await KeyHandler.deleteById(
      request.headers.authorization,
      request.params.id,
    );
  }
}
