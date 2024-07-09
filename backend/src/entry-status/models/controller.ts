import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface EntryStatusCreateBody {
    label: string;
}

export const EntryStatusCreateBodySchema: ObjectSchema = {
    label: {
        __type: 'string',
        __required: true,
    },
};

export interface EntryStatusUpdateBody {
    _id: string;
    label: string;
}

export const EntryStatusUpdateBodySchema: ObjectSchema = {
    label: {
        __type: 'string',
        __required: true,
    },
};
