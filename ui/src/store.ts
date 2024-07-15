import { ref } from 'vue';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';
import type { ApiKey } from '@thebcms/selfhosted-backend/api-key/models/main';
import type { SdkStore } from '@thebcms/selfhosted-sdk';
import { createArrayStore } from '@thebcms/selfhosted-ui/util/array-store';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type {
    Entry,
    EntryLite,
} from '@thebcms/selfhosted-backend/entry/models/main';
import type { Language } from '@thebcms/selfhosted-backend/language/models/main';
import type { EntryStatus } from '@thebcms/selfhosted-backend/entry-status/models/main';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import type { TemplateOrganizer } from '@thebcms/selfhosted-backend/template-organizer/models/main';

const me = ref<UserProtected | null>(null);

export const Store: SdkStore = {
    user: createArrayStore<
        UserProtected,
        {
            me(): UserProtected | null;
        }
    >('_id', [], (store) => {
        return {
            me() {
                const sdk = window.bcms.sdk;
                if (sdk.accessToken) {
                    me.value = store.findById(
                        sdk.accessToken.payload.userId,
                    ) as UserProtected;
                }
                return me.value;
            },
        };
    }),
    apiKey: createArrayStore<ApiKey>('_id', []),
    template: createArrayStore<Template>('_id'),
    templateOrganizer: createArrayStore<TemplateOrganizer>('_id', []),
    media: createArrayStore<Media>('_id'),
    widget: createArrayStore<Widget>('_id'),
    group: createArrayStore<Group>('_id'),
    entry: createArrayStore<Entry>('_id'),
    entryLite: createArrayStore<EntryLite>('_id'),
    language: createArrayStore<Language>('_id'),
    entryStatus: createArrayStore<EntryStatus>('_id'),
    backup: createArrayStore<Backup>('_id'),
};

export function useStore() {
    return Store;
}
