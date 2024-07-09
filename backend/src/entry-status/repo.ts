import {
    type EntryStatus,
    EntryStatusSchema,
} from '@thebcms/selfhosted-backend/entry-status/models/main';
import { createMongoDBRepository } from '@thebcms/selfhosted-backend/server/modules/mongodb';
import { Config } from '@thebcms/selfhosted-backend/config';

export const EntryStatusRepo = createMongoDBRepository<EntryStatus, void>({
    name: 'EntryStatus',
    collection: `${Config.storageScope}_entry_statuses`,
    schema: EntryStatusSchema,
});
