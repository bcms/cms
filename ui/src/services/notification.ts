import * as uuid from 'uuid';
import type { JSX } from 'vue/jsx-runtime';

export interface NotificationMessage {
    id: string;
    type: NotificationMessageType;
    content: string | (() => JSX.Element);
}

export type NotificationMessageType = 'info' | 'error' | 'success' | 'warning';

export class NotificationService {
    private handlers: Array<{
        id: string;
        handler(type: NotificationMessageType, content: string): void;
    }> = [];

    register(
        handler: (type: NotificationMessageType, content: string) => void,
    ): () => void {
        const id = uuid.v4();
        this.handlers.push({ id, handler });
        return () => {
            for (let i = 0; i < this.handlers.length; i++) {
                if (this.handlers[i].id === id) {
                    this.handlers.splice(i, 1);
                    break;
                }
            }
        };
    }

    info(content: string): void {
        this.handlers.forEach((e) => {
            e.handler('info', content);
        });
    }

    warning(content: string): void {
        this.handlers.forEach((e) => {
            e.handler('warning', content);
        });
    }

    success(content: string): void {
        this.handlers.forEach((e) => {
            e.handler('success', content);
        });
    }

    error(content: string): void {
        this.handlers.forEach((e) => {
            e.handler('error', content);
        });
    }

    push(type: NotificationMessageType, content: string): void {
        this.handlers.forEach((e) => {
            e.handler(type, content);
        });
    }
}

let service: NotificationService | null = null;

export function createNotificationService(): NotificationService {
    service = new NotificationService();
    return service;
}

export function useNotificationService() {
    if (!service) {
        throw Error('Notification service not initialized');
    }
    return service;
}
