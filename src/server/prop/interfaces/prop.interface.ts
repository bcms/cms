export enum PropType {
  QUILL = 'QUILL',

  GROUP_POINTER = 'GROUP_POINTER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  ENUMERATION = 'ENUMERATION',
  BOOLEAN = 'BOOLEAN',

  ENTRY_POINTER = 'ENTRY_POINTER',

  GROUP_POINTER_ARRAY = 'GROUP_POINTER_ARRAY',
  STRING_ARRAY = 'STRING_ARRAY',
  NUMBER_ARRAY = 'NUMBER_ARRAY',
  BOOLEAN_ARRAY = 'BOOLEAN_ARRAY',
}

export enum PropQuillContentType {
  HEADING_1 = 'HEADING_1',
  HEADING_2 = 'HEADING_2',
  HEADING_3 = 'HEADING_3',
  HEADING_4 = 'HEADING_4',
  HEADING_5 = 'HEADING_5',
  PARAGRAPH = 'PARAGRAPH',
  LIST = 'LIST',
  EMBED = 'EMBED',
  MEDIA = 'MEDIA',
  CODE = 'CODE',
  WIDGET = 'WIDGET',
}

export interface Prop {
  type: PropType;
  required: boolean;
  name: string;
  value:
    | string
    | string[]
    | boolean
    | boolean[]
    | number
    | number[]
    | PropEnum
    | PropQuill
    | PropGroupPointer
    | PropGroupPointerArray
    | PropEntryPointer;
}

export interface PropEnum {
  items: string[];
  selected?: string;
}

export interface PropEntryPointer {
  templateId: string;
  entryId: string;
}

export interface PropQuill {
  heading: {
    title: string;
    slug: string;
    desc: string;
    coverImageUri: string;
  };
  content: PropQuillContent[];
}

export interface PropQuillContent {
  id: string;
  type: PropQuillContentType;
  value: PropQuillContentValueGeneric | PropQuillContentValueWidget;
  valueAsText: string;
}

export interface PropQuillContentValueGeneric {
  ops: Array<{
    insert: string;
    attributes?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strike?: boolean;
      list?: string;
      indent?: number;
      link?: string;
    };
  }>;
}

export interface PropQuillContentValueWidget {
  _id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  desc: string;
  props: Prop[];
}

export interface PropGroupPointer {
  _id: string;
  props: Prop[];
}

export interface PropGroupPointerArray {
  _id: string;
  props: Prop[];
  array: Array<{
    value: PropGroupPointer;
  }>;
}
