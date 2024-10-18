import type { BCMSFunction } from '@bcms/selfhosted-backend/function/models/main';

export function createFunction(handler: () => Promise<BCMSFunction>) {
    return handler;
}
