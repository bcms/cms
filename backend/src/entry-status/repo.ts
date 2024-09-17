import {
    type EntryStatus,
    EntryStatusSchema,
} from '@bcms/selfhosted-backend/entry-status/models/main';
import { createMongoDBRepository } from '@bcms/selfhosted-backend/_server/modules/mongodb';
import { Config } from '@bcms/selfhosted-backend/config';

export const EntryStatusRepo = createMongoDBRepository<EntryStatus, void>({
    name: 'EntryStatus',
    collection: `${Config.storageScope}_entry_statuses`,
    schema: EntryStatusSchema,
});
