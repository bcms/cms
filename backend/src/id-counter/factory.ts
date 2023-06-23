import { Types } from 'mongoose';
import type { BCMSIdCounterFactory } from '../types';

export function createBcmsIdCounterFactory(): BCMSIdCounterFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        count: data.count ? data.count : 1,
        name: data.name ? data.name : '',
        forId: data.forId ? data.forId : '',
      };
    },
  };
}
