import { expect } from 'chai';
import { client, Env } from '../util';

describe('Entry handler', async () => {
  it('should get all entries for a template', async () => {
    const entries = await client.entry.getAll(Env.templateId);
    expect(entries).to.be.a('array');
    expect(entries[0]).to.be.a('object').to.have.property('_id');
  });
  it('should get a single entry from a template', async () => {
    const entry = await client.entry.get({
      entryId: Env.entryId,
      templateId: Env.templateId,
    });
    expect(entry).to.be.a('object').to.have.property('_id');
  });
});
