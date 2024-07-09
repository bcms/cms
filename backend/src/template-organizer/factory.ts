import { ObjectId } from 'mongodb';
import type { TemplateOrganizer } from '@thebcms/selfhosted-backend/template-organizer/models/main';

export class TemplateOrganizerFactory {
    static create(
        data: Omit<TemplateOrganizer, '_id' | 'createdAt' | 'updatedAt'>,
    ): TemplateOrganizer {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
