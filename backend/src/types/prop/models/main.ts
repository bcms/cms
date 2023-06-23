import type {
  BCMSPropColorPickerData,
  BCMSPropRichTextData,
  BCMSPropRichTextDataParsed,
  BCMSPropValueRichTextData,
} from '@backend/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import type { BCMSPropDateData } from './date';
import type {
  BCMSPropEntryPointerData,
  BCMSPropEntryPointerDataParsed,
  BCMSPropValueEntryPointer,
} from './entry-pointer';
import type { BCMSPropEnumData } from './enum';
import type {
  BCMSPropGroupPointerData,
  BCMSPropGroupPointerDataParsed,
  BCMSPropValueGroupPointerData,
} from './group-pointer';
import type {
  BCMSPropMediaData,
  BCMSPropMediaDataParsed,
  BCMSPropValueMediaData,
} from './media';
import type { BCMSPropTagData } from './tag';
import type {
  BCMSPropValueWidgetData,
  BCMSPropWidgetData,
  BCMSPropWidgetDataParsed,
} from './widget';

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
export interface BCMSPropGql {
  id: string;
  type: BCMSPropType;
  required: boolean;
  name: string;
  label: string;
  array: boolean;
  defaultData: BCMSPropDataGql & {
    __typename: string;
  };
}
export const BCMSPropSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  type: {
    __type: 'string',
    __required: true,
  },
  required: {
    __type: 'boolean',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: true,
  },
  array: {
    __type: 'boolean',
    __required: true,
  },
};

export type BCMSPropData =
  | string[]
  | boolean[]
  | number[]
  | BCMSPropDateData
  | BCMSPropEnumData
  | BCMSPropEntryPointerData[]
  | BCMSPropGroupPointerData[]
  | BCMSPropMediaData[]
  | BCMSPropWidgetData
  | BCMSPropRichTextData[]
  | BCMSPropColorPickerData;
export interface BCMSPropDataGqlValueString {
  string: string[];
}
export interface BCMSPropDataGqlValueNumber {
  number: number[];
}
export interface BCMSPropDataGqlValueBoolean {
  boolean: boolean[];
}
export interface BCMSPropDataGqlValueRichText {
  richText: BCMSPropRichTextData[];
}
export type BCMSPropDataGql =
  | BCMSPropDataGqlValueString
  | BCMSPropDataGqlValueNumber
  | BCMSPropDataGqlValueBoolean
  | BCMSPropDataGqlValueRichText
  | BCMSPropEnumData
  | BCMSPropEntryPointerData[]
  | BCMSPropGroupPointerData
  | BCMSPropWidgetData
  | BCMSPropColorPickerData
  | BCMSPropMediaData[]
  | BCMSPropDateData
  | BCMSPropTagData;
export interface BCMSPropParsed {
  [name: string]: BCMSPropDataParsed;
}
export interface BCMSPropDataInputGql {
  string?: string[];
  number?: number[];
  colorPicker?: BCMSPropColorPickerData;
  boolean?: boolean[];
  entryPointer?: BCMSPropEntryPointerData[];
  enum?: BCMSPropEnumData;
  groupPointer?: BCMSPropGroupPointerData[];
  media?: BCMSPropMediaData[];
  date?: BCMSPropDateData;
  tag?: BCMSPropTagData;
}

export type BCMSPropDataParsed =
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | BCMSPropEnumData
  | BCMSPropEntryPointerData[]
  | BCMSPropEntryPointerData
  | BCMSPropEntryPointerDataParsed
  | BCMSPropEntryPointerDataParsed[]
  | BCMSPropGroupPointerDataParsed
  | BCMSPropGroupPointerDataParsed[]
  | BCMSPropWidgetDataParsed
  | BCMSPropMediaDataParsed
  | BCMSPropMediaDataParsed[]
  | BCMSPropRichTextDataParsed;

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
