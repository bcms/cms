import type { BCMSProp } from './prop';
import type { BCMSEntity } from './_entity';

export interface BCMSGroup extends BCMSEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  props: BCMSProp[];
}
