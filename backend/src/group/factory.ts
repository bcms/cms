import { ObjectId } from 'mongodb';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';

export class GroupFactory {
    static create(data: Omit<Group, '_id' | 'createdAt' | 'updatedAt'>): Group {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
