import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataEntry extends SocketEventDataDefault {
    templateId: string;
    entryId: string;
}

export const SocketEventDataEntrySchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    templateId: {
        __type: 'string',
        __required: true,
    },
    entryId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesEntry = {
    entry: SocketEventDataEntry;
};
