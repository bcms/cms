import type { SocketEventNamesUser } from '@bcms/selfhosted-backend/socket/events/user';
import type { SocketEventNamesGroup } from '@bcms/selfhosted-backend/socket/events/group';
import type { SocketEventNamesTemplate } from '@bcms/selfhosted-backend/socket/events/template';
import type { SocketEventNamesWidget } from '@bcms/selfhosted-backend/socket/events/widget';
import type { SocketEventNamesMedia } from '@bcms/selfhosted-backend/socket/events/media';
import type { SocketEventNamesApiKey } from '@bcms/selfhosted-backend/socket/events/api-key';
import type { SocketEventNamesLanguage } from '@bcms/selfhosted-backend/socket/events/language';
import type { SocketEventNamesEntry } from '@bcms/selfhosted-backend/socket/events/entry';
import type { SocketEventNamesEntryStatus } from '@bcms/selfhosted-backend/socket/events/entry-status';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import type { SocketEventNamesEntrySync } from '@bcms/selfhosted-backend/socket/events/entry-sync';
import type { SocketEventNamesTemplateOrganizer } from '@bcms/selfhosted-backend/socket/events/template-organizer';
import type { SocketEventNamesBackup } from '@bcms/selfhosted-backend/socket/events/backup';

export interface SocketEventDataDefault {
    /**
     * Action type.
     *
     * u - update (which includes 'create', 'update')
     * d - delete
     */
    type: 'update' | 'delete';
}

export const SocketEventDataDefaultSchema: ObjectSchema = {
    type: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataConnection extends SocketEventDataDefault {
    id: string;
}

export const SocketEventDataConnectionSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    id: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesAndTypes = {
    refresh: void;
    socket_connection: SocketEventDataDefault;
} & SocketEventNamesApiKey &
    SocketEventNamesEntry &
    SocketEventNamesEntryStatus &
    SocketEventNamesEntrySync &
    SocketEventNamesGroup &
    SocketEventNamesLanguage &
    SocketEventNamesMedia &
    SocketEventNamesTemplate &
    SocketEventNamesTemplateOrganizer &
    SocketEventNamesUser &
    SocketEventNamesWidget &
    SocketEventNamesBackup;

export type SocketEventName = keyof SocketEventNamesAndTypes;
export type SocketEventData =
    SocketEventNamesAndTypes[keyof SocketEventNamesAndTypes];
