import type { BCMSEntity } from './_entity';

export type BCMSColorSourceType = 'group' | 'widget' | 'template';

export interface BCMSColorSource {
  id: string;
  type: BCMSColorSourceType;
}

export interface BCMSColor extends BCMSEntity {
  cid: string;
  label: string;
  name: string;
  value: string;
  userId: string;
  source: BCMSColorSource;
}
