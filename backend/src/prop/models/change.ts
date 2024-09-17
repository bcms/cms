import {
    type PropData,
    PropDataSchema,
    type PropType,
} from '@bcms/selfhosted-backend/prop/models/main';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import {
    type PropEntryPointerData,
    PropEntryPointerDataSchema,
} from '@bcms/selfhosted-backend/prop/models/entry-pointer';

export interface PropChangeTransform {
    /** ID on property which will be transformed. */
    from: string;
    /** To which property type */
    to: PropType;
}

export const PropChangeTransformSchema: ObjectSchema = {
    from: {
        __type: 'string',
        __required: true,
    },
    to: {
        __type: 'string',
        __required: true,
    },
};

export interface PropChangeAdd {
    label: string;
    type: PropType;
    required: boolean;
    array: boolean;
    data: PropData;
}

export const PropChangeAddSchema: ObjectSchema = {
    label: {
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

export interface PropChangeUpdate {
    /** ID of the property which should be updated. */
    id: string;
    label: string;
    move: number;
    required: boolean;
    array?: boolean;
    enumItems?: string[];
    entryPointer?: PropEntryPointerData[];
}

export const PropChangeUpdateSchema: ObjectSchema = {
    id: {
        __type: 'string',
        __required: true,
    },
    label: {
        __type: 'string',
        __required: true,
    },
    move: {
        __type: 'number',
        __required: true,
    },
    required: {
        __type: 'boolean',
        __required: true,
    },
    enumItems: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'string',
        },
    },
    entryPointer: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: PropEntryPointerDataSchema,
        },
    },
};

export interface PropChange {
    add?: PropChangeAdd;
    /** ID of the property which will be removed. */
    remove?: string;
    update?: PropChangeUpdate;
    transform?: PropChangeTransform;
}

export const PropChangeSchema: ObjectSchema = {
    add: {
        __type: 'object',
        __required: false,
        __child: PropChangeAddSchema,
    },
    remove: {
        __type: 'string',
        __required: false,
    },
    update: {
        __type: 'object',
        __required: false,
        __child: PropChangeUpdateSchema,
    },
    transform: {
        __type: 'object',
        __required: false,
        __child: PropChangeTransformSchema,
    },
};
