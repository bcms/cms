import type {
  BCMSEntryContentNode,
  BCMSEntryContentParsedItem,
} from '../entry';

export interface BCMSPropRichTextData {
  nodes: BCMSEntryContentNode[];
}

export interface BCMSPropValueRichTextData {
  nodes: BCMSEntryContentNode[];
}

export type BCMSPropRichTextDataParsed =
  | BCMSEntryContentParsedItem[]
  | BCMSEntryContentParsedItem[][];
