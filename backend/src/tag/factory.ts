import type { BCMSTagFactory } from '@backend/types/tag';
import { Types } from 'mongoose';

export function createBcmsTagFactory(): BCMSTagFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        value: data.value ? data.value : '',
        cid: data.cid ? data.cid : '',
      };
    },
  };
}
