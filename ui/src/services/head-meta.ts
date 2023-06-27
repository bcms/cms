import type { BCMSHeadMetaService } from '../types';

let service: BCMSHeadMetaService;

export function createBcmsHeadMetaService(): void {
  service = {
    set(options) {
      if (options.title) {
        document.title = `${options.title} | BCMS`;
      }
    },
  };
}

export function useBcmsHeadMetaService(): BCMSHeadMetaService {
  return service;
}
