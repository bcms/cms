import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import { ObjectId } from '@fastify/mongodb';

export class MediaFactory {
    static create(data: Omit<Media, '_id' | 'createdAt' | 'updatedAt'>): Media {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
