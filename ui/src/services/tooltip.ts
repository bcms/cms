import type { BCMSTooltipService } from '../types';

let service: BCMSTooltipService;

export function createBcmsTooltipService(): void {
  service = {
    show() {
      throw new Error('Assertion error');
    },
    hide() {
      throw new Error('Assertion error');
    },
  };
}

export function useBcmsTooltipService(): BCMSTooltipService {
  return service;
}
