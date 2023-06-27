import type { BCMSProp } from '../prop';
import type { BCMSWidget } from './models';

export interface BCMSWidgetFactory {
  create(data: {
    cid?: string;
    name?: string;
    label?: string;
    desc?: string;
    previewImage?: string;
    previewScript?: string;
    previewStyle?: string;
    props?: BCMSProp[];
  }): BCMSWidget;
}
