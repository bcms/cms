export type BCMSNotificationMessageType =
  | 'info'
  | 'error'
  | 'success'
  | 'warning';

export interface BCMSNotificationService {
  register(
    handler: (type: BCMSNotificationMessageType, content: string) => void
  ): () => void;
  info(content: string): void;
  warning(content: string): void;
  success(content: string): void;
  error(content: string): void;
  push(type: BCMSNotificationMessageType, content: string): void;
}
