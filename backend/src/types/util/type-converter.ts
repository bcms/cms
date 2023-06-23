import type { BCMSProp } from '../prop';

export interface BCMSTypeConverterProp {
  name: string;
  type: string;
}

export interface BCMSTypeConverterRootTS {
  name: string;
  type: 'interface' | 'type';
  output: string;
  description?: string;
}

export interface BCMSTypeConverterResultTS {
  root: BCMSTypeConverterRootTS;
  extends?: string[];
  union?: string[];
  props: BCMSTypeConverterProp[];
  dependencies?: BCMSTypeConverterResultTS[];
}

export interface BCMSTypeConverterResultItem {
  outputFile: string;
  content: string;
}

export interface BCMSTypeConverterPropsResult {
  props: Array<{
    name: string;
    type: string;
  }>;
  imports: Array<{
    names: string[];
    path: string;
  }>;
}

export interface BCMSTypeConverterTarget {
  name: string;
  type: 'entry' | 'group' | 'widget' | 'enum' | 'template';
  props?: BCMSProp[];
  enumItems?: string[];
}
