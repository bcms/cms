import type { BCMSMedia } from '@becomes/cms-sdk/types';

export interface BCMSMultiSelectItem {
  id: string;
  title: string;
  subtitle?: string;
  imageId?: string;
  selected?: boolean;
}

export interface BCMSMultiSelectItemExtended extends BCMSMultiSelectItem {
  image?: BCMSMedia;
}
