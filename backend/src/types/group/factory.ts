import type { BCMSGroup, BCMSGroupLite, BCMSGroupGql } from './models';

export interface BCMSGroupFactory {
  create(config: {
    cid: string;
    label: string;
    name: string;
    desc: string;
  }): BCMSGroup;
  toLite(group: BCMSGroup): BCMSGroupLite;
  toGql(group: BCMSGroup): BCMSGroupGql;
}
