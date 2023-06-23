import type { BCMSEvent } from '../types';

export function createBcmsEvent(fn: () => Promise<BCMSEvent>): () => Promise<BCMSEvent> {
  return fn;
}
