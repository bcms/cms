import { expect } from 'chai';
import { client, Env } from '../util';

describe('Entry handler', async () => {
  it('should get all media', async () => {
    const media = await client.media.getAll();
    expect(media).to.be.a('array');
    expect(media[0])
      .to.be.a('object')
      .to.have.property('data')
      .to.have.property('_id');
    expect(media[0]).to.have.property('bin');
  });
  it('should get a single media and its binary data', async () => {
    const media = await client.media.get(Env.mediaId);
    expect(media)
      .to.be.a('object')
      .to.have.property('data')
      .to.have.property('_id');
    expect(media.data).to.have.property('type');
    expect(media).to.have.property('bin');
    await media.bin();
  });
});
