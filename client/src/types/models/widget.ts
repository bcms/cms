import type { BCMSProp } from './prop';
import type { BCMSEntity } from './_entity';

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
