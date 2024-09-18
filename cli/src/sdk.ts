import { homedir } from 'os';
import path from 'path';
import {
    createSdk,
    type Sdk,
    type SdkStore,
    type StorageSubscriptionHandler,
    type SdkStorage,
} from '@bcms/selfhosted-sdk';
import { FS } from '@bcms/selfhosted-utils/fs';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import { createArrayStore } from '@bcms/selfhosted-cli/util/array-store';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import type { TemplateOrganizer } from '@bcms/selfhosted-backend/template-organizer/models/main';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type {
    Entry,
    EntryLite,
} from '@bcms/selfhosted-backend/entry/models/main';
import type { EntryStatus } from '@bcms/selfhosted-backend/entry-status/models/main';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import type { Backup } from '@bcms/selfhosted-backend/backup/models/main';
import cuid2 from '@paralleldrive/cuid2';

let me: UserProtected | null = null;

const sdkStore: SdkStore = {
    user: createArrayStore<
        UserProtected,
        {
            me(): UserProtected | null;
        }
    >('_id', [], (store) => {
        return {
            me() {
                if (sdk.accessToken) {
                    me = store.findById(
                        sdk.accessToken.payload.userId,
                    ) as UserProtected;
                }
                return me;
            },
        };
    }),
    apiKey: createArrayStore<ApiKey>('_id', []),
    template: createArrayStore<Template>('_id', []),
    templateOrganizer: createArrayStore<TemplateOrganizer>('_id', []),
    group: createArrayStore<Group>('_id', []),
    widget: createArrayStore<Widget>('_id', []),
    media: createArrayStore<Media>('_id', []),
    entry: createArrayStore<Entry>('_id', []),
    entryStatus: createArrayStore<EntryStatus>('_id', []),
    entryLite: createArrayStore<EntryLite>('_id', []),
    language: createArrayStore<Language>('_id', []),
    backup: createArrayStore<Backup>('_id', []),
};

async function createStorage(): Promise<SdkStorage> {
    const fs = new FS(path.join(homedir(), '.selfbcms', 'storage.json'));
    let _storage: {
        [key: string]: unknown;
    } = {};
    if (await fs.exist('', true)) {
        _storage = JSON.parse(await fs.readString(''));
    }
    const subs: {
        [id: string]: {
            key: string;
            handler: StorageSubscriptionHandler<unknown>;
        };
    } = {};

    return {
        async clear() {
            _storage = {};
            await fs.save('', JSON.stringify(_storage, null, 4));
            for (const id in subs) {
                await subs[id].handler(null, 'remove');
            }
        },
        async set(key, value) {
            _storage[key] = value;
            await fs.save('', JSON.stringify(_storage, null, 4));
            for (const id in subs) {
                if (subs[id].key === key) {
                    await subs[id].handler(value, 'set');
                }
            }
            return true;
        },
        async remove(key) {
            if (!_storage[key]) {
                return;
            }
            delete _storage[key];
            await fs.save('', JSON.stringify(_storage, null, 4));
            for (const id in subs) {
                if (subs[id].key === key) {
                    await subs[id].handler(null, 'remove');
                }
            }
        },
        get<Value = unknown>(key: string) {
            return (_storage[key] as Value) || null;
        },
        subscribe(key, handler) {
            const id = cuid2.createId();
            subs[id] = { key, handler: handler as never };
            return () => {
                delete subs[id];
            };
        },
    };
}

let sdk: Sdk = null as never;

export async function sdkCreate(apiOrigin: string) {
    sdk = createSdk(sdkStore, await createStorage(), {
        apiOrigin,
    });
    return sdk;
}
