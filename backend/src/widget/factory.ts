import { Types } from 'mongoose';
import type { BCMSWidgetFactory } from '../types';

export function createBcmsWidgetFactory(): BCMSWidgetFactory {
  return {
    create(data) {
      return {
        _id: `${new Types.ObjectId()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: data.cid ? data.cid : '',
        desc: data.desc ? data.desc : '',
        label: data.label ? data.label : '',
        name: data.name ? data.name : '',
        previewImage: data.previewImage ? data.previewImage : '',
        previewScript: data.previewScript ? data.previewScript : '',
        previewStyle: data.previewStyle ? data.previewStyle : '',
        props: [],
      };
    },
  };
}
