import type { BCMSEntity } from './entity';
import type { BCMSProp, BCMSPropChange } from './prop';

export interface BCMSTemplate extends BCMSEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  userId: string;
  singleEntry: boolean;
  props: BCMSProp[];
}

export interface BCMSTemplateCreateData {
  label: string;
  desc: string;
  singleEntry: boolean;
}

export interface BCMSTemplateUpdateData {
  _id: string;
  label?: string;
  desc?: string;
  singleEntry?: boolean;
  propChanges?: BCMSPropChange[];
}
