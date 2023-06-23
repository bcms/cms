import type { BCMSPropParsed, BCMSPropValue } from '../prop';

export interface BCMSEntryMeta {
  lng: string;
  props: BCMSPropValue[];
}

export interface BCMSEntryParsedMeta {
  [lng: string]: BCMSPropParsed;
}
