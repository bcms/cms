import type { BCMSEvent } from '@thebcms/selfhosted-backend/event/models/main';

export function createEvent(handler: () => Promise<BCMSEvent>) {
    return handler;
}
