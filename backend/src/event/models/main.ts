import type { User } from '@thebcms/selfhosted-backend/user/models/main';
import type { ApiKey } from '@thebcms/selfhosted-backend/api-key/models/main';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import type { Entry } from '@thebcms/selfhosted-backend/entry/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { EntryStatus } from '@thebcms/selfhosted-backend/entry-status/models/main';
import type { TemplateOrganizer } from '@thebcms/selfhosted-backend/template-organizer/models/main';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';
import type { ObjectSchema } from '@thebcms/selfhosted-utils/object-utility';

export type BCMSEventType = 'all' | 'update' | 'add' | 'delete';

export interface BCMSEventDataType {
    all: unknown;
    apiKey: ApiKey;
    backup: Backup;
    entry: Entry;
    entryStatus: EntryStatus;
    group: Group;
    language: Language;
    media: Media;
    template: Template;
    templateOrganizer: TemplateOrganizer;
    user: User;
    widgets: Widget;
}

export type BCMSEventScope = keyof BCMSEventDataType;

export interface BCMSEventConfig {
    scope: BCMSEventScope;
    type: BCMSEventType;
}

export const BCMSEventConfigSchema: ObjectSchema = {
    scope: {
        __type: 'string',
        __required: true,
    },
    type: {
        __type: 'string',
        __required: true,
    },
};

export interface BCMSEvent {
    config: BCMSEventConfig;
    handler<Scope extends BCMSEventScope = BCMSEventScope>(
        type: BCMSEventType,
        scope: Scope,
        data: BCMSEventDataType[Scope],
    ): Promise<void>;
}

export const BCMSEventSchema: ObjectSchema = {
    config: {
        __type: 'object',
        __required: true,
        __child: BCMSEventConfigSchema,
    },
    handler: {
        __type: 'function',
        __required: true,
    },
};
