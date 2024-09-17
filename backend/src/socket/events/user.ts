import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataUser extends SocketEventDataDefault {
    /**
     * User ID.
     */
    userId: string;
}
export const SocketEventDataUserSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    userId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesUser = {
    user: SocketEventDataUser;
};
