import { ObjectId } from 'mongodb';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';

export class TemplateFactory {
    static create(
        data: Omit<Template, '_id' | 'createdAt' | 'updatedAt'>,
    ): Template {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
