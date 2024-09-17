import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface TemplateOrganizerCreateBody {
    label: string;
    templateIds: string[];
}

export const TemplateOrganizerCreateBodySchema: ObjectSchema = {
    label: {
        __type: 'string',
        __required: true,
    },
    templateIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};

export interface TemplateOrganizerUpdateBody {
    _id: string;
    label?: string;
    templateIds?: string[];
}

export const TemplateOrganizerUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    label: {
        __type: 'string',
        __required: false,
    },
    templateIds: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'string',
        },
    },
};
