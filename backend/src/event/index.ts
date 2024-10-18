import type { BCMSEvent } from '@bcms/selfhosted-backend/event/models/main';

export function createEvent(handler: () => Promise<BCMSEvent>) {
    return handler;
}
