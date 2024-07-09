import { ObjectId } from 'mongodb';
import type { EntryStatus } from '@thebcms/selfhosted-backend/entry-status/models/main';

export class EntryStatusFactory {
    static create(
        data: Omit<EntryStatus, '_id' | 'createdAt' | 'updatedAt'>,
    ): EntryStatus {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
