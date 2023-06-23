import type { BCMSPropValueWidgetData } from '../prop';

export interface BCMSEntryContent {
  lng: string;
  nodes: BCMSEntryContentNode[];
}

export interface BCMSEntryContentNode {
  type: BCMSEntryContentNodeType;
  content?: BCMSEntryContentNode[];
  attrs?:
    | BCMSEntryContentNodeHeadingAttr
    | BCMSPropValueWidgetData
    | BCMSEntryContentNodeLinkAttr;
  marks?: BCMSEntryContentNodeMarker[];
  text?: string;
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
  attrs: BCMSEntryContentNodeLinkAttr;
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
