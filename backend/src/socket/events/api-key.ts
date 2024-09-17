import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';
import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';

export interface SocketEventDataApiKey extends SocketEventDataDefault {
    apiKey: string;
}

export const SocketEventDataApiKeySchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    apiKey: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesApiKey = {
    api_key: SocketEventDataApiKey;
};
