import {
    type HttpErrorHandler,
    HttpStatus,
} from '@thebcms/selfhosted-backend/server';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import type { UserPolicyCRUD } from '@thebcms/selfhosted-backend/user/models/policy';
import type { ApiKey } from '@thebcms/selfhosted-backend/api-key/models/main';

export class RPApiKey {
    private canAccessMethod(method: string, access: UserPolicyCRUD) {
        switch (method.toLowerCase()) {
            case 'get': {
                return access.get;
            }
            case 'post': {
                return access.post;
            }
            case 'put': {
                return access.put;
            }
            case 'delete': {
                return access.delete;
            }
        }
        return true;
    }

    async verify(
        errorHandler: HttpErrorHandler,
        method: string,
        apiKeyString?: string | string[],
        templateId?: string,
        functionName?: string,
    ): Promise<ApiKey> {
        if (!apiKeyString) {
            throw errorHandler(HttpStatus.Unauthorized, 'Missing API Key');
        }
        const [keyId, keySecret] = ('' + apiKeyString)
            .replace('ApiKey ', '')
            .split('.');
        if (!keyId || !keySecret) {
            throw errorHandler(
                HttpStatus.Unauthorized,
                'Invalid API Key format',
            );
        }
        const apiKey = await Repo.apiKey.findById(keyId);
        if (!apiKey) {
            throw errorHandler(HttpStatus.Unauthorized, 'Invalid API Key');
        }
        if (apiKey.blocked) {
            throw errorHandler(HttpStatus.Forbidden, 'API Key is blocked');
        }
        if (apiKey.secret !== keySecret) {
            throw errorHandler(HttpStatus.Unauthorized, 'Invalid API Key');
        }
        if (templateId) {
            const access = apiKey.access.templates.find(
                (e) => e._id === templateId,
            );
            if (!access) {
                throw errorHandler(
                    HttpStatus.Forbidden,
                    `API Key is not allowed to access template "${templateId}"`,
                );
            } else {
                if (!this.canAccessMethod(method, access)) {
                    throw errorHandler(
                        HttpStatus.Forbidden,
                        `API Key cannot access "${method}" method for template "${templateId}"`,
                    );
                }
            }
        }
        if (functionName) {
            if (!apiKey.access.functions.find((e) => e.name === functionName)) {
                throw errorHandler(
                    HttpStatus.Forbidden,
                    `API Key is not allowed to access function "${functionName}"`,
                );
            }
        }
        return apiKey;
    }
}
