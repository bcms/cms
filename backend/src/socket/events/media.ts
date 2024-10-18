import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataMedia extends SocketEventDataDefault {
    mediaId: string;
}

export const SocketEventDataMediaSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    mediaId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesMedia = {
    media: SocketEventDataMedia;
};
