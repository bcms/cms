import type {
  BCMSPropRichTextData,
  BCMSPropValueRichTextData,
} from './rich-text';
import type { BCMSPropDateData } from './date';
import type {
  BCMSPropEntryPointerData,
  BCMSPropValueEntryPointer,
} from './entry-pointer';
import type { BCMSPropEnumData } from './enum';
import type {
  BCMSPropGroupPointerData,
  BCMSPropGroupPointerDataParsed,
  BCMSPropValueGroupPointerData,
} from './group-pointer';
import type { BCMSPropMediaData, BCMSPropMediaDataParsed, BCMSPropValueMediaData } from './media';
import type {
  BCMSPropValueWidgetData,
  BCMSPropWidgetData,
  BCMSPropWidgetDataParsed,
} from './widget';
import type { BCMSPropColorPickerData } from './color-picker';
// eslint-disable-next-line no-shadow
export enum BCMSPropType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',

  DATE = 'DATE',
  ENUMERATION = 'ENUMERATION',
  MEDIA = 'MEDIA',

  GROUP_POINTER = 'GROUP_POINTER',
  ENTRY_POINTER = 'ENTRY_POINTER',
  WIDGET = 'WIDGET',

  COLOR_PICKER = 'COLOR_PICKER',
  RICH_TEXT = 'RICH_TEXT',
  TAG = 'TAG',
}

export interface BCMSProp {
  id: string;
  type: BCMSPropType;
  required: boolean;
  name: string;
  label: string;
  array: boolean;
  defaultData: BCMSPropData;
}

export type BCMSPropData =
  | string[]
  | boolean[]
  | number[]
  | BCMSPropDateData
  | BCMSPropEnumData
  | BCMSPropEntryPointerData[]
  | BCMSPropGroupPointerData
  | BCMSPropMediaData[]
  | BCMSPropWidgetData
  | BCMSPropRichTextData[]
  | BCMSPropColorPickerData;

export interface BCMSPropParsed {
  [name: string]: BCMSPropDataParsed;
}

export type BCMSPropDataParsed =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | BCMSPropEnumData
  | BCMSPropEntryPointerData
  | BCMSPropGroupPointerDataParsed
  | BCMSPropGroupPointerDataParsed[]
  | BCMSPropWidgetDataParsed
  | BCMSPropMediaDataParsed
  | BCMSPropMediaDataParsed[]
  | {
      type: BCMSPropType;
      value: BCMSPropDataParsed;
    };

export interface BCMSPropValue {
  /**
   * This property value is the same as in BCMSProp.
   * Using it, prop can be connected with metadata.
   */
  id: string;
  data: BCMSPropValueData;
}

export type BCMSPropValueData =
  | string[]
  | boolean[]
  | number[]
  | BCMSPropDateData
  | BCMSPropValueGroupPointerData
  | BCMSPropValueMediaData[]
  | BCMSPropValueWidgetData
  | BCMSPropValueRichTextData[]
  | BCMSPropValueEntryPointer[];
