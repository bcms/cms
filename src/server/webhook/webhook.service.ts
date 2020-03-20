import { IMongooseEntityService, MongooseEntityService } from 'purple-cheetah';
import { Webhook, IWebhook } from './models/webhook.model';

@MongooseEntityService({
  db: {
    name: `${process.env.DB_PRFX}_webhooks`,
  },
  entity: {
    schema: Webhook.schema,
    convertInterfaceToClassFunction: (e: IWebhook): Webhook => {
      return e;
    },
  },
})
export class WebhookService implements IMongooseEntityService<Webhook> {
  findAll: () => Promise<Webhook[]>;
  findAllById: (ids: string[]) => Promise<Webhook[]>;
  findById: (id: string) => Promise<Webhook>;
  add: (e: Webhook) => Promise<boolean>;
  update: (e: Webhook) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
}
