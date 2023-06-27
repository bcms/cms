import { Types } from 'mongoose';
import type { BCMSStatusFactory } from '../types';

export function createBcmsStatusFactory(): BCMSStatusFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        color: data.color ? data.color : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
      };
    },
  };
}
