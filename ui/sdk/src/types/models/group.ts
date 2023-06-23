import type { BCMSEntity } from './entity';
import type { BCMSProp, BCMSPropChange } from './prop';

export interface BCMSGroup extends BCMSEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  props: BCMSProp[];
}

export interface BCMSGroupLite extends BCMSEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  propsCount: number;
}

export interface BCMSGroupAddData {
  label: string;
  desc: string;
}

export interface BCMSGroupUpdateData {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: BCMSPropChange[];
}
