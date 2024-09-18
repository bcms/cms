import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface Config {
    cmsOrigin?: string;
    client?: {
        apiKey: {
            id: string;
            secret: string;
        };
    };
}

export const ConfigSchema: ObjectSchema = {
    cmsOrigin: {
        __type: 'string',
        __required: false,
    },
    client: {
        __type: 'object',
        __required: false,
        __child: {
            apiKey: {
                __type: 'object',
                __required: true,
                __child: {
                    id: {
                        __type: 'string',
                        __required: true,
                    },
                    secret: {
                        __type: 'string',
                        __required: true,
                    },
                },
            },
        },
    },
};
