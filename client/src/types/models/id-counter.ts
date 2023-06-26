import type { BCMSEntity } from './_entity';

export interface BCMSIdCounter extends BCMSEntity {
  name: string;
  forId: string;
  count: number;
}
