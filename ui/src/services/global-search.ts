import type { BCMSGlobalSearchService } from '../types';

export function createBCMSGlobalSearchService(): BCMSGlobalSearchService {
  return {
    show() {
      throw new Error('Not mounted');
    },
    hide() {
      throw new Error('Not mounted');
    },
  };
}
