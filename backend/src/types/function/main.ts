import type { BCMSFunction } from './models';

export interface BCMSFunctionManager {
  clear(): void;
  get(name: string): BCMSFunction<unknown> | undefined;
  getAll(): BCMSFunction<unknown>[];
}
