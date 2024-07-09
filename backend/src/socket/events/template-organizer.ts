import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataTemplateOrganizer
    extends SocketEventDataDefault {
    templateOrganizerId: string;
}

export const SocketEventDataTemplateOrganizerSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    templateOrganizerId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesTemplateOrganizer = {
    template_organizer: SocketEventDataTemplateOrganizer;
};
