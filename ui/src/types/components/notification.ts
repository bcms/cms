import type { BCMSNotificationMessageType } from '../services';

export interface BCMSNotificationMessage {
  id: string;
  type: BCMSNotificationMessageType;
  content: string;
}
