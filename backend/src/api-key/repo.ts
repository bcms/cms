import { createMongoDBRepository } from '@thebcms/selfhosted-backend/server/modules/mongodb';
import {
    type ApiKey,
    ApiKeySchema,
} from '@thebcms/selfhosted-backend/api-key/models/main';
import { Config } from '@thebcms/selfhosted-backend/config';

export const ApiKeyRepo = createMongoDBRepository<ApiKey, void>({
    name: 'ApiKey',
    collection: `${Config.dbPrefix}_api_keys`,
    schema: ApiKeySchema,
});
