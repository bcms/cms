import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export const cronTimeRegexp =
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/g;

export interface BCMSJob {
    cronTime: string;
    handler(): Promise<void>;
}

export const BCMSJobSchema: ObjectSchema = {
    cronTime: {
        __type: 'string',
        __required: true,
    },
    handler: {
        __type: 'function',
        __required: true,
    },
};
