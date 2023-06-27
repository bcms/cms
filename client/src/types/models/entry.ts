import type {
  BCMSPropValue,
  BCMSPropValueWidgetData,
  BCMSPropParsed,
} from './prop';
import type { BCMSEntity } from './_entity';

export interface BCMSEntryContent {
  lng: string;
  nodes: BCMSEntryContentNode[];
  plainText: string;
}

export interface BCMSEntryContentNode {
  type: BCMSEntryContentNodeType;
  content?: BCMSEntryContentNode[];
  attrs?:
    | BCMSEntryContentNodeHeadingAttr
    | BCMSPropValueWidgetData
    | BCMSEntryContentNodeLinkAttr
    | BCMSEntryContentNodeCodeBlockAttr;
  marks?: BCMSEntryContentNodeMarker[];
  text?: string;
}

export interface BCMSEntryContentNodeCodeBlockAttr {
  language: string | null;
}

export interface BCMSEntryContentNodeHeadingAttr {
  level: number;
}

export interface BCMSEntryContentNodeLinkAttr {
  href: string;
  target: string;
}

export interface BCMSEntryContentNodeMarker {
  type: BCMSEntryContentNodeMarkerType;
  attrs?: BCMSEntryContentNodeLinkAttr;
}

// eslint-disable-next-line no-shadow
export enum BCMSEntryContentNodeType {
  paragraph = 'paragraph',
  heading = 'heading',
  widget = 'widget',
  bulletList = 'bulletList',
  listItem = 'listItem',
  orderedList = 'orderedList',
  text = 'text',
  codeBlock = 'codeBlock',
}

// eslint-disable-next-line no-shadow
export enum BCMSEntryContentNodeMarkerType {
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  strike = 'strike',
  link = 'link',
}

export interface BCMSEntryMeta {
  lng: string;
  props: BCMSPropValue[];
}

export interface BCMSEntry extends BCMSEntity {
  cid: string;
  templateId: string;
  userId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export interface BCMSEntryParsedMeta {
  [lng: string]: BCMSPropParsed;
}

export interface BCMSEntryContentParsedItem {
  type: BCMSEntryContentNodeType;
  attrs?: {
    level?: number;
  };
  name?: string;
  value: string | BCMSPropParsed;
}

export interface BCMSEntryContentParsed {
  [lng: string]: BCMSEntryContentParsedItem[];
}

export interface BCMSEntryParsed extends BCMSEntity {
  templateId: string;
  templateName: string;
  userId: string;
  status: string;
  meta: BCMSEntryParsedMeta;
  content: BCMSEntryContentParsed;
}

export interface BCMSEntryCreateData {
  templateId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}

export interface BCMSEntryUpdateData {
  _id: string;
  templateId: string;
  status?: string;
  meta: BCMSEntryMeta[];
  content: BCMSEntryContent[];
}
