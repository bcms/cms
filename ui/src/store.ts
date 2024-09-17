import { ref } from 'vue';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type { SdkStore } from '@bcms/selfhosted-sdk';
import { createArrayStore } from '@bcms/selfhosted-ui/util/array-store';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type {
    Entry,
    EntryLite,
} from '@bcms/selfhosted-backend/entry/models/main';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type { Backup } from '@bcms/selfhosted-backend/backup/models/main';
import type { TemplateOrganizer } from '@bcms/selfhosted-backend/template-organizer/models/main';

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
