import { createMongoDBRepository } from '@bcms/selfhosted-backend/_server/modules/mongodb';
import {
    type ApiKey,
    ApiKeySchema,
} from '@bcms/selfhosted-backend/api-key/models/main';
import { Config } from '@bcms/selfhosted-backend/config';

export const ApiKeyRepo = createMongoDBRepository<ApiKey, void>({
    name: 'ApiKey',
    collection: `${Config.dbPrefix}_api_keys`,
    schema: ApiKeySchema,
});
