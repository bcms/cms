import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataLanguage extends SocketEventDataDefault {
    languageId: string;
}

export const SocketEventDataLanguageSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    language: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesLanguage = {
    language: SocketEventDataLanguage;
};
