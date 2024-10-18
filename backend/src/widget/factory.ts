import { ObjectId } from 'mongodb';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';

export class WidgetFactory {
    static create(
        data: Omit<Widget, '_id' | 'createdAt' | 'updatedAt'>,
    ): Widget {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
