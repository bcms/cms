import type {
  BCMSNotificationMessageType,
  BCMSNotificationService,
} from '../types';
import * as uuid from 'uuid';

let service: BCMSNotificationService;

export function createBcmsNotificationService(): void {
  const handlers: Array<{
    id: string;
    handler(type: BCMSNotificationMessageType, content: string): void;
  }> = [];
  service = {
    register(handler) {
      const id = uuid.v4();
      handlers.push({ id, handler });
      return () => {
        for (let i = 0; i < handlers.length; i++) {
          if (handlers[i].id === id) {
            handlers.splice(i, 1);
            break;
          }
        }
      };
    },
    push(type, content) {
      handlers.forEach((e) => {
        e.handler(type, content);
      });
    },
    info(content) {
      handlers.forEach((e) => {
        e.handler('info', content);
      });
    },
    error(content) {
      handlers.forEach((e) => {
        e.handler('error', content);
      });
    },
    warning(content) {
      handlers.forEach((e) => {
        e.handler('warning', content);
      });
    },
    success(content) {
      handlers.forEach((e) => {
        e.handler('success', content);
      });
    },
  };
}

export function useBcmsNotificationService(): BCMSNotificationService {
  return service;
}
