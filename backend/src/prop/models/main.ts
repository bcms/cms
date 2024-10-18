import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import {
    type PropDateData,
    PropDateDataSchema,
} from '@bcms/selfhosted-backend/prop/models/date';
import {
    type PropEnumData,
    PropEnumDataSchema,
} from '@bcms/selfhosted-backend/prop/models/enum';
import {
    type PropEntryPointerData,
    PropEntryPointerDataSchema,
    type PropValueEntryPointer,
} from '@bcms/selfhosted-backend/prop/models/entry-pointer';
import {
    type PropGroupPointerData,
    type PropGroupPointerDataParsed,
    PropGroupPointerDataSchema,
    type PropValueGroupPointerData,
} from '@bcms/selfhosted-backend/prop/models/group-pointer';
import type {
    PropMediaData,
    PropMediaDataParsed,
    PropValueMediaData,
} from '@bcms/selfhosted-backend/prop/models/media';
import {
    type PropValueWidgetData,
    type PropWidgetData,
    type PropWidgetDataParsed,
    PropWidgetDataSchema,
} from '@bcms/selfhosted-backend/prop/models/widget';
import type {
    PropRichTextData,
    PropRichTextDataParsed,
    PropValueRichTextData,
} from '@bcms/selfhosted-backend/prop/models/rich-text';
import type { EntryParsed } from '@bcms/selfhosted-backend/entry/models/main';

// eslint-disable-next-line no-shadow
export enum PropType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',

    DATE = 'DATE',
    ENUMERATION = 'ENUMERATION',
    MEDIA = 'MEDIA',

    GROUP_POINTER = 'GROUP_POINTER',
    ENTRY_POINTER = 'ENTRY_POINTER',
    WIDGET = 'WIDGET',

    RICH_TEXT = 'RICH_TEXT',
}

export interface PropData {
    propString?: string[];
    propNumber?: number[];
    propBool?: boolean[];
    propDate?: PropDateData[];
    propEnum?: PropEnumData;
    propEntryPointer?: PropEntryPointerData[];
    propGroupPointer?: PropGroupPointerData;
    propMedia?: PropMediaData[];
    propWidget?: PropWidgetData;
    propRichText?: PropRichTextData[];
}

export const PropDataSchema: ObjectSchema = {
    propString: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'string',
        },
    },
    propNumber: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'number',
        },
    },
    propBool: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'boolean',
        },
    },
    propDate: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: PropDateDataSchema,
        },
    },
    propEnum: {
        __type: 'object',
        __required: false,
        __child: PropEnumDataSchema,
    },
    propEntryPointer: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: PropEntryPointerDataSchema,
        },
    },
    propGroupPointer: {
        __type: 'object',
        __required: false,
        __child: PropGroupPointerDataSchema,
    },
    propMedia: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'string',
        },
    },
    propWidget: {
        __type: 'object',
        __required: false,
        __child: PropWidgetDataSchema,
    },
    // Rich Text is a recursive object which can be
    // validated only at runtime.
    //
    // ---->    propRichText: PropRichTextData[],
};

export interface Prop {
    id: string;
    type: PropType;
    required: boolean;
    name: string;
    label: string;
    array: boolean;
    data: PropData;
}
export const PropSchema: ObjectSchema = {
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
    data: {
        __type: 'object',
        __required: true,
        __child: PropDataSchema,
    },
};

export type PropDataParsed =
    | undefined
    | null
    | string
    | string[]
    | boolean
    | boolean[]
    | number
    | number[]
    | PropValueData
    | PropDateData
    | PropDateData[]
    | PropEnumData
    | PropEntryPointerData[]
    | PropEntryPointerData
    | EntryParsed
    | EntryParsed[]
    | PropGroupPointerDataParsed
    | PropGroupPointerDataParsed[]
    | PropWidgetDataParsed
    | PropMediaDataParsed
    | PropMediaDataParsed[]
    | PropRichTextDataParsed
    | PropRichTextDataParsed[];

export interface PropParsed {
    [name: string]: PropDataParsed;
}

export type PropValueData =
    | string[]
    | boolean[]
    | number[]
    | PropDateData[]
    | PropValueGroupPointerData
    | PropValueMediaData[]
    | PropValueWidgetData
    | PropValueRichTextData[]
    | PropValueEntryPointer[];

export interface PropValue {
    /**
     * This property value is the same as in BCMSProp.
     * Using it, prop can be connected with metadata.
     */
    id: string;
    data: PropValueData;
}
