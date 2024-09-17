import type { User } from '@bcms/selfhosted-backend/user/models/main';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type { Backup } from '@bcms/selfhosted-backend/backup/models/main';
import type { Entry } from '@bcms/selfhosted-backend/entry/models/main';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type { TemplateOrganizer } from '@bcms/selfhosted-backend/template-organizer/models/main';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

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
