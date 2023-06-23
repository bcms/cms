import type { FSDBEntity } from '@becomes/purple-cheetah-mod-fsdb/types';

export interface BCMSGroupLite extends FSDBEntity {
  cid: string;
  name: string;
  label: string;
  desc: string;
  propsCount: number;
}
