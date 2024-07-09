import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import { ObjectId } from '@fastify/mongodb';

export class BackupFactory {
    static create(
        data: Omit<Backup, '_id' | 'createdAt' | 'updatedAt'>,
    ): Backup {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
