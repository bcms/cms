import type { BCMSMedia } from '@becomes/cms-sdk/types';

export interface BCMSMediaService {
  getPath(data: { allMedia: BCMSMedia[]; target: BCMSMedia }): string[];
}
