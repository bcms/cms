import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export type PropDateData = {
    timestamp: number;
    timezoneOffset: number;
};

export const PropDateDataSchema: ObjectSchema = {
    timestamp: {
        __type: 'number',
        __required: true,
    },
    timezoneOffset: {
        __type: 'number',
        __required: true,
    },
};

export type PropValueDateData = {
    timestamp: number;
    timezoneOffset: number;
};

export const PropValueDateDataSchema: ObjectSchema = {
    timestamp: {
        __type: 'number',
        __required: true,
    },
    timezoneOffset: {
        __type: 'number',
        __required: true,
    },
};
