import type { BCMSEntity } from './_entity';

export type BCMSChangeName =
  | 'entry'
  | 'group'
  | 'color'
  | 'language'
  | 'media'
  | 'status'
  | 'tag'
  | 'templates'
  | 'widget';

export interface BCMSChange extends BCMSEntity {
  name: BCMSChangeName;
  count: number;
}
