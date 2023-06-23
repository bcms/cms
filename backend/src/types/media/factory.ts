import type { BCMSMedia, BCMSMediaType } from './models';

export interface BCMSMediaFactory {
  create(data: {
    userId?: string;
    type?: BCMSMediaType;
    mimetype?: string;
    size?: number;
    name?: string;
    isInRoot?: boolean;
    hasChildren?: boolean;
    parentId?: string;
    altText: string;
    caption: string;
    width: number;
    height: number;
  }): BCMSMedia;
}
