import type { BCMSMediaType } from '../media';

export type BCMSPropMediaData = string;

export interface BCMSPropMediaDataParsed {
  _id: string;
  src: string;
  name: string;
  width: number;
  height: number;
  caption: string;
  alt_text: string;
  type: BCMSMediaType;
  svg?: string;
}

export type BCMSMediaParsed = BCMSPropMediaDataParsed;

export interface BCMSPropValueMediaData {
  _id: string;
  alt_text?: string;
  caption?: string;
}
