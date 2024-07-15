import type { BCMSFunction } from '@thebcms/selfhosted-backend/function/models/main';

export function createFunction(handler: () => Promise<BCMSFunction>) {
    return handler;
}
