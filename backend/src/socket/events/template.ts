import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataTemplate extends SocketEventDataDefault {
    templateId: string;
}

export const SocketEventDataTemplateSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    templateId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesTemplate = {
    template: SocketEventDataTemplate;
};
