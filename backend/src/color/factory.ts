import type { BCMSColorFactory } from '@backend/types';
import { Types } from 'mongoose';

export function createBcmsColorFactory(): BCMSColorFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        value: data.value ? data.value : '',
        userId: data.userId ? data.userId : '',
        global: data.global || true,
      };
    },
  };
}
