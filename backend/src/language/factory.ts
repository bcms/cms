import { Types } from 'mongoose';
import type { BCMSLanguageFactory } from '../types';

export function createBcmsLanguageFactory(): BCMSLanguageFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        code: data.code ? data.code : '',
        def: data.def ? data.def : false,
        name: data.name ? data.name : '',
        nativeName: data.nativeName ? data.nativeName : '',
        userId: data.userId ? data.userId : '',
      };
    },
  };
}
