import type { PropValueWidgetData } from '@thebcms/selfhosted-backend/prop/models/widget';
import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import type { PropParsed } from '@thebcms/selfhosted-backend/prop/models/main';

// eslint-disable-next-line no-shadow
export enum EntryContentNodeMarkerType {
    bold = 'bold',
    italic = 'italic',
    underline = 'underline',
    strike = 'strike',
    link = 'link',
    inlineCode = 'inlineCode',
}

// eslint-disable-next-line no-shadow
export enum EntryContentNodeType {
    paragraph = 'paragraph',
    heading = 'heading',
    widget = 'widget',
    bulletList = 'bulletList',
    listItem = 'listItem',
    orderedList = 'orderedList',
    text = 'text',
    codeBlock = 'codeBlock',
    hardBreak = 'hardBreak',
}

export interface EntryContentNodeHeadingAttr {
    level: number;
}

export interface EntryContentNodeLinkAttr {
    href: string;
    target: string;
}

export interface EntryContentNodeWidgetAttr {
    data: PropValueWidgetData;
    propPath: string;
}

export interface EntryContentNodeMarker {
    type: EntryContentNodeMarkerType;
    attrs?: EntryContentNodeLinkAttr;
}

export type EntryContentNodeAttrs =
    | EntryContentNodeHeadingAttr
    | EntryContentNodeWidgetAttr
    | EntryContentNodeLinkAttr;

export interface EntryContentNode {
    type: EntryContentNodeType;
    content?: EntryContentNode[];
    attrs?: EntryContentNodeAttrs;
    marks?: EntryContentNodeMarker[];
    text?: string;
}

export const EntryContentNodePartialSchema: ObjectSchema = {
    type: {
        __type: 'string',
        __required: true,
    },
    marks: {
        __type: 'string',
        __required: false,
    },
    text: {
        __type: 'string',
        __required: false,
    },
};

export interface EntryContent {
    lng: string;
    nodes: EntryContentNode[];
    plainText: string;
}

export const EntryContentSchema: ObjectSchema = {
    lng: {
        __type: 'string',
        __required: true,
    },
    plainText: {
        __type: 'string',
        __required: false,
    },
};

export interface EntryContentParsedItem {
    type: EntryContentNodeType;
    widgetName?: string;
    attrs?: EntryContentNodeAttrs;
    value: string | PropParsed;
}

export interface EntryContentParsed {
    [lng: string]: EntryContentParsedItem[];
}
