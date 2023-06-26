import type { BCMSProp } from './prop';
import type { BCMSEntity } from './_entity';

export interface BCMSTemplate extends BCMSEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  userId: string;
  singleEntry: boolean;
  props: BCMSProp[];
}
