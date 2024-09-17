import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    type PropChange,
    PropChangeSchema,
} from '@bcms/selfhosted-backend/prop/models/change';

export interface TemplateWhereIsItUsedResult {
    groupsIds: string[];
    templateIds: string[];
    widgetIds: string[];
}

export const TemplateWhereIsItUsedResultSchema: ObjectSchema = {
    groupIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
    templateIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
    widgetIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};

export interface TemplateCreateBody {
    label: string;
    desc: string;
    singleEntry: boolean;
}

export const TemplateCreateBodySchema: ObjectSchema = {
    label: {
        __type: 'string',
        __required: true,
    },
    desc: {
        __type: 'string',
        __required: true,
    },
};

export interface TemplateUpdateBody {
    _id: string;
    singleEntry?: boolean;
    label?: string;
    desc?: string;
    propChanges?: PropChange[];
}
export const TemplateUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    singleEntry: {
        __type: 'boolean',
        __required: false,
    },
    label: {
        __type: 'string',
        __required: false,
    },
    desc: {
        __type: 'string',
        __required: false,
    },
    propChanges: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: PropChangeSchema,
        },
    },
};
