import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';
import type { ArrayStore } from '@thebcms/selfhosted-ui/util/array-store';
import type { ApiKey } from '@thebcms/selfhosted-backend/api-key/models/main';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type {
    Entry,
    EntryLite,
} from '@thebcms/selfhosted-backend/entry/models/main';
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import type { EntryStatus } from '@thebcms/selfhosted-backend/entry-status/models/main';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import type { TemplateOrganizer } from '@thebcms/selfhosted-backend/template-organizer/models/main';

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
