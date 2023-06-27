import type { BCMSChangeFactory } from '@backend/types';
import { Types } from 'mongoose';

export function createBcmsChangeFactory(): BCMSChangeFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: data.name || 'color',
        count: data.count || 0,
      };
    },
  };
}
