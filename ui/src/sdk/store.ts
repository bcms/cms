import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import type { ArrayStore } from '@bcms/selfhosted-ui/util/array-store';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type {
    Entry,
    EntryLite,
} from '@bcms/selfhosted-backend/entry/models/main';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type { Backup } from '@bcms/selfhosted-backend/backup/models/main';
import type { TemplateOrganizer } from '@bcms/selfhosted-backend/template-organizer/models/main';

export interface SdkStore {
    user: ArrayStore<
        UserProtected,
        {
            me(): UserProtected | null;
        }
    >;
    apiKey: ArrayStore<ApiKey>;
    template: ArrayStore<Template>;
    templateOrganizer: ArrayStore<TemplateOrganizer>;
    group: ArrayStore<Group>;
    widget: ArrayStore<Widget>;
    media: ArrayStore<Media>;
    entry: ArrayStore<Entry>;
    entryStatus: ArrayStore<EntryStatus>;
    entryLite: ArrayStore<EntryLite>;
    language: ArrayStore<Language>;
    backup: ArrayStore<Backup>;
}
