import type { BCMSJob } from '../types';

export function createBcmsJob(fn: () => Promise<BCMSJob>): () => Promise<BCMSJob> {
  return fn;
}
