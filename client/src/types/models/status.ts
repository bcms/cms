import type { BCMSEntity } from './_entity';

export interface BCMSStatus extends BCMSEntity {
  label: string;
  name: string;
  color: string;
}
