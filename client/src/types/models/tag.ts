import type { BCMSEntity } from './_entity';

export interface BCMSTag extends BCMSEntity {
  /** Unique */
  value: string;
  cid: string;
}
