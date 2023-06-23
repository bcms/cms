import type { BCMSEntity } from './entity';
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

export interface BCMSChangeGetDataProp {
  count: number;
  lastChangeAt: number;
}

export interface BCMSChangeGetData {
  entry: BCMSChangeGetDataProp;
  group: BCMSChangeGetDataProp;
  color: BCMSChangeGetDataProp;
  language: BCMSChangeGetDataProp;
  media: BCMSChangeGetDataProp;
  status: BCMSChangeGetDataProp;
  tag: BCMSChangeGetDataProp;
  templates: BCMSChangeGetDataProp;
  widget: BCMSChangeGetDataProp;
}
