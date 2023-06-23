import type { BCMSProp, BCMSPropType, BCMSPropGql } from './models';

export interface BCMSPropFactory {
  create(type: BCMSPropType, array?: boolean): BCMSProp | null;
  string(array?: boolean): BCMSProp;
  number(array?: boolean): BCMSProp;
  bool(array?: boolean): BCMSProp;
  date(array?: boolean): BCMSProp;
  enum(array?: boolean): BCMSProp;
  media(array?: boolean): BCMSProp;
  groupPointer(array?: boolean): BCMSProp;
  entryPointer(array?: boolean): BCMSProp;
  richText(array?: boolean): BCMSProp;
  colorPicker(array?: boolean): BCMSProp;
  tag(array?: boolean): BCMSProp;
  widget(array?: boolean): BCMSProp;
  toGql(prop: BCMSProp | BCMSProp[]): BCMSPropGql | BCMSPropGql[];
}
