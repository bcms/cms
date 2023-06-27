import type { BCMSEntity } from "./entity";
import type { BCMSProp, BCMSPropChange } from "./prop";

export interface BCMSWidget extends BCMSEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  previewImage: string;
  previewScript: string;
  previewStyle: string;
  props: BCMSProp[];
}

export interface BCMSWidgetCreateData {
  label: string;
  desc: string;
  previewImage: string;
  previewScript: string;
  previewStyle: string;
}

export interface BCMSWidgetUpdateData {
  _id: string;
  label?: string;
  desc?: string;
  previewImage?: string;
  previewScript?: string;
  previewStyle?: string;
  propChanges?: BCMSPropChange[];
}