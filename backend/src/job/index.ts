import type { BCMSJob } from '@thebcms/selfhosted-backend/job/models/main';

export function createJob(handler: () => Promise<BCMSJob>) {
    return handler;
}
