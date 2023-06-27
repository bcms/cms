import type {
  BCMSEntryContentNode,
  BCMSEntryContentParsedItem,
} from '@backend/types';

export interface BCMSPropRichTextData {
  nodes: BCMSEntryContentNode[];
}

export interface BCMSPropValueRichTextData {
  nodes: BCMSEntryContentNode[];
}

export type BCMSPropRichTextDataParsed =
  | BCMSEntryContentParsedItem[]
  | BCMSEntryContentParsedItem[][];
