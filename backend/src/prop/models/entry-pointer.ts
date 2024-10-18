import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface PropEntryPointerData {
    templateId: string;
    entryIds: string[];
    displayProp: string;
}

export const PropEntryPointerDataSchema: ObjectSchema = {
    templateId: {
        __type: 'string',
        __required: true,
    },
    entryIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
    displayProp: {
        __type: 'string',
        __required: true,
    },
};

export interface PropValueEntryPointer {
    tid: string;
    eid: string;
}

export const PropValueEntryPointerSchema: ObjectSchema = {
    tid: {
        __type: 'string',
        __required: true,
    },
    eid: {
        __type: 'string',
        __required: true,
    },
};
