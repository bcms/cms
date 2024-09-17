import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';
import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';

export interface SocketEventDataGroup extends SocketEventDataDefault {
    groupId: string;
}

export const SocketEventDataGroupSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    groupId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesGroup = {
    group: SocketEventDataGroup;
};
