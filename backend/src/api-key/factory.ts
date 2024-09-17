import type { ApiKey } from '@bcms/selfhosted-backend/api-key/models/main';
import { ObjectId } from '@fastify/mongodb';
import { FunctionManager } from '@bcms/selfhosted-backend/function/main';

export class ApiKeyFactory {
    static create(
        data: Omit<ApiKey, '_id' | 'createdAt' | 'updatedAt'>,
    ): ApiKey {
        return {
            _id: new ObjectId().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }

    static rewriteKey(key: ApiKey): { key: ApiKey; modified: boolean } {
        const k: ApiKey = JSON.parse(JSON.stringify(key));
        let modified = false;
        const fns = FunctionManager.getAll();
        for (let i = 0; i < fns.length; i++) {
            const fn = fns[i];
            if (
                fn.config.public &&
                !k.access.functions.find((e) => e.name === fn.config.name)
            ) {
                modified = true;
                k.access.functions.push({ name: fn.config.name });
            }
        }
        const removeFunctions: string[] = [];
        for (let i = 0; i < k.access.functions.length; i++) {
            const keyFn = k.access.functions[i];
            if (!fns.find((fn) => fn.config.name === keyFn.name)) {
                removeFunctions.push(keyFn.name);
            }
        }
        if (removeFunctions.length > 0) {
            modified = true;
            k.access.functions = k.access.functions.filter(
                (e) => !removeFunctions.includes(e.name),
            );
        }
        // TODO: rewrite templates

        return {
            key: k,
            modified,
        };
    }
}
