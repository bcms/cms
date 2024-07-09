import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataEntryStatus extends SocketEventDataDefault {
    entryStatusId: string;
}

export const SocketEventDataEntryStatusSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    entryStatusId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesEntryStatus = {
    entry_status: SocketEventDataEntryStatus;
};
