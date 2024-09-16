import { createMongoDBRepository } from '@thebcms/selfhosted-backend/_server/modules/mongodb';
import {
    type Backup,
    BackupSchema,
} from '@thebcms/selfhosted-backend/backup/models/main';
import { Config } from '@thebcms/selfhosted-backend/config';

export const BackupRepo = createMongoDBRepository<Backup, undefined>({
    name: 'Backup',
    schema: BackupSchema,
    collection: `${Config.dbPrefix}_backups`,
});
