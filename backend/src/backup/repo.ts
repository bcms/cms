import { createMongoDBRepository } from '@bcms/selfhosted-backend/_server/modules/mongodb';
import {
    type Backup,
    BackupSchema,
} from '@bcms/selfhosted-backend/backup/models/main';
import { Config } from '@bcms/selfhosted-backend/config';

export const BackupRepo = createMongoDBRepository<Backup, undefined>({
    name: 'Backup',
    schema: BackupSchema,
    collection: `${Config.dbPrefix}_backups`,
});
