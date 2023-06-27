import type { BCMSConfirmService } from '../types';

let service: BCMSConfirmService;

export function useBcmsConfirmService(): BCMSConfirmService {
  return service;
}

export function createBcmsConfirmService(): void {
  service = async (title, text, prompt) => {
    return new Promise<boolean>((resolve) => {
      window.bcms.modal.confirm.show({
        title,
        body: text,
        prompt,
        onDone() {
          resolve(true);
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  };
}
