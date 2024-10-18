import type { BCMSJob } from '@bcms/selfhosted-backend/job/models/main';

export function createJob(handler: () => Promise<BCMSJob>) {
    return handler;
}
