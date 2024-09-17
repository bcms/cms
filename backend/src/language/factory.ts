import { ObjectId } from 'mongodb';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';

export class LanguageFactory {
    static create(
        data: Omit<Language, '_id' | 'createdAt' | 'updatedAt'>,
    ): Language {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }
}
