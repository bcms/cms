import {
    type Language,
    LanguageSchema,
} from '@thebcms/selfhosted-backend/language/models/main';
import { createMongoDBRepository } from '@thebcms/selfhosted-backend/_server/modules/mongodb';

export interface LanguageRepoMethods {
    findByCode(code: string): Promise<Language | null>;
}

export const LanguageRepo = createMongoDBRepository<
    Language,
    LanguageRepoMethods
>({
    name: 'Language',
    collection: 'languages',
    schema: LanguageSchema,
    methods({ mdb, cache }) {
        return {
            async findByCode(code) {
                const cacheHit = cache.find((e) => e.code === code);
                if (cacheHit) {
                    return cacheHit;
                }
                const result = await mdb.findOne({ code });
                if (result) {
                    cache.set(result);
                }
                return result;
            },
        };
    },
});
