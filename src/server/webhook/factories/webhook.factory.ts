import { Webhook } from '../models/webhook.model';
import { Types } from 'mongoose';

export class WebhookFactory {
  public static get instance(): Webhook {
    return new Webhook(
      new Types.ObjectId(),
      Date.now(),
      Date.now(),
      '',
      '',
      '{}',
    );
  }
}
