import { Types } from 'mongoose';
import { BCMSMediaFactory, BCMSMediaType } from '../types';

export function createBcmsMediaFactory(): BCMSMediaFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        hasChildren: data.hasChildren ? data.hasChildren : false,
        isInRoot: data.isInRoot ? data.isInRoot : false,
        mimetype: data.mimetype ? data.mimetype : '',
        name: data.name ? data.name : '',
        parentId: data.parentId ? data.parentId : '',
        size: data.size ? data.size : 0,
        type: data.type ? data.type : BCMSMediaType.DIR,
        userId: data.userId ? data.userId : '',
        altText: data.altText ? data.altText : '',
        caption: data.caption ? data.caption : '',
        height: data.height ? data.height : -1,
        width: data.width ? data.width : -1,
      };
    },
  };
}
