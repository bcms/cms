import { Service } from 'purple-cheetah';
import { WebhookService } from './webhook.service';
import { Webhook } from './models/webhook.model';
import { Types } from 'mongoose';

export class WebhookCashService {
  @Service(WebhookService)
  private static service: WebhookService;
  private static items: Webhook[] = [];

  public static async init() {
    WebhookCashService.items = await WebhookCashService.service.findAll();
  }

  public static findAll(): Webhook[] {
    return JSON.parse(JSON.stringify(WebhookCashService.items));
  }

  public static findAllById(ids: string[]): Webhook[] {
    return WebhookCashService.items.filter(webhook =>
      ids.find(e => e === webhook._id.toHexString()),
    );
  }

  public static findById(id: string): Webhook | null {
    const webhook = WebhookCashService.items.find(
      e => e._id.toHexString() === id,
    );
    return webhook ? webhook : null;
  }

  /** Adds a Key to the cash and to the database. */
  public static async add(item: Webhook): Promise<boolean> {
    item._id = new Types.ObjectId();
    item.createdAt = Date.now();
    item.updatedAt = Date.now();
    const result = await WebhookCashService.service.add(item);
    if (result === false) {
      return false;
    }
    WebhookCashService.items.push(item);
    return true;
  }

  /** Updates a Key in the cash and the database. */
  public static async update(item: Webhook): Promise<boolean> {
    const result = await WebhookCashService.service.update(item);
    if (result === false) {
      return false;
    }
    WebhookCashService.items.forEach(e => {
      if (e._id.toHexString() === item._id.toHexString()) {
        e = JSON.parse(JSON.stringify(item));
      }
    });
    return true;
  }

  /** Removes a Key from the cash and the database. */
  // tslint:disable-next-line:variable-name
  public static async deleteById(_id: string): Promise<boolean> {
    const result = await WebhookCashService.service.deleteById(_id);
    if (result === false) {
      return false;
    }
    WebhookCashService.items = WebhookCashService.items.filter(
      e => e._id.toHexString() !== _id,
    );
    return true;
  }
}
