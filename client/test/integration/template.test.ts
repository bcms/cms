import { client, Env } from '../util';

describe('Template handler', async () => {
  it('should get a template', async () => {
    await client.template.get(Env.templateId);
  });
});
