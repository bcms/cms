import type { BCMSPropDataParsed, BCMSPropValue } from './main';

export interface BCMSPropWidgetData {
  _id: string;
}

export interface BCMSPropWidgetDataParsed {
  [key: string]: BCMSPropDataParsed;
}

export interface BCMSPropValueWidgetData {
  _id: string;
  props: BCMSPropValue[];
}
