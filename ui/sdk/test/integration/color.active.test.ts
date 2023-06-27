import { expect } from 'chai';
import { before } from 'mocha';
import {
  login,
  ObjectUtil,
  sdk,
  setupTemplates,
  SetupTemplatesResult,
} from '../util';

describe('Color API', async () => {
  let idColor: string;
  let cIdColor: string;
  let sourceId: string;
  let sourceType: string;
  let tData: SetupTemplatesResult;
  before(async () => {
    await login();
    tData = await setupTemplates();
  });
  after(async () => {
    await tData.clear();
  });
  it('should create new color', async () => {
    const result = await sdk.color.create({
      label: 'black',
      value: '#030504',
      global: true,
    });
    idColor = result._id;
    cIdColor = result.cid;
    expect(result).to.be.instanceOf(Object);
    expect(result).to.have.property('_id').to.be.a('string');
    expect(result).to.have.property('createdAt').to.be.a('number');
    expect(result).to.have.property('updatedAt').to.be.a('number');
    expect(result).to.have.property('cid').to.be.a('string');
    ObjectUtil.eq(
      result,
      {
        label: 'black',
        name: 'black',
        value: '#030504',
        userId: '111111111111111111111111',
        global: true,
      },
      'color',
    );
  });
  it('should be able to update color', async () => {
    const result = await sdk.color.update({
      _id: idColor,
      label: 'Blue',
      value: '#1155ff',
    });
    expect(result).to.be.instanceOf(Object);
    expect(result).to.have.property('_id').to.be.a('string').eq(idColor);
    expect(result).to.have.property('createdAt').to.be.a('number');
    expect(result).to.have.property('updatedAt').to.be.a('number');
    expect(result).to.have.property('cid').to.be.a('string');
    ObjectUtil.eq(
      result,
      {
        label: 'Blue',
        name: 'blue',
        value: '#1155ff',
        userId: '111111111111111111111111',
        source: { id: sourceId, type: sourceType },
      },
      'color',
    );
  });
  it('should be to get all colors', async () => {
    const results = await sdk.color.getAll();
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      expect(result).to.be.instanceOf(Object);
      expect(result).to.have.property('_id').to.be.a('string');
      expect(result).to.have.property('createdAt').to.be.a('number');
      expect(result).to.have.property('updatedAt').to.be.a('number');
      expect(result).to.have.property('cid').to.be.a('string');
      expect(result).to.have.property('label').to.be.a('string');
      expect(result).to.have.property('name').to.be.a('string');
      expect(result).to.have.property('value').to.be.a('string');
      expect(result).to.have.property('source').to.be.a('object');
      expect(result).to.have.property('userId').to.be.a('string');
    }
  });
  it('should get many colors in 1 request', async () => {
    const manyCId = [cIdColor, cIdColor];
    expect(manyCId).to.be.a('array');
    const results = await sdk.color.getMany(manyCId);
    expect(results).to.be.a('array');
    expect(results.length).gte(0);
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < manyCId.length; j++) {
        const result = results[i];
        expect(result).to.be.instanceOf(Object);
        expect(result).to.have.property('_id').to.be.a('string');
        expect(result).to.have.property('createdAt').to.be.a('number');
        expect(result).to.have.property('updatedAt').to.be.a('number');
        expect(result).to.have.property('cid').to.be.a('string').eq(manyCId[j]);
        expect(result).to.have.property('label').to.be.a('string');
        expect(result).to.have.property('name').to.be.a('string');
        expect(result).to.have.property('value').to.be.a('string');
        expect(result).to.have.property('source').to.be.a('object');
        expect(result).to.have.property('userId').to.be.a('string');
      }
    }
  });
  it('should get number of Colors', async () => {
    const result = await sdk.color.count();
    expect(result).to.be.a('number');
  });
  it('should get a specific Color', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idColor).to.be.a('string');
    const result = await sdk.color.get(idColor);
    expect(result).to.be.instanceOf(Object);
    expect(result).to.have.property('_id').to.be.a('string').eq(idColor);
    expect(result).to.have.property('createdAt').to.be.a('number');
    expect(result).to.have.property('updatedAt').to.be.a('number');
    expect(result).to.have.property('cid').to.be.a('string');
    expect(result).to.have.property('label').to.be.a('string');
    expect(result).to.have.property('name').to.be.a('string');
    expect(result).to.have.property('value').to.be.a('string');
    expect(result).to.have.property('source').to.be.a('object');
    expect(result).to.have.property('userId').to.be.a('string');
  });
  it('should fail when trying to get a color which does not exist', async () => {
    // eslint-disable-next-line no-unused-expressions
    try {
      const result = await sdk.color.get('6184f06acbf8c33bfe92b042');

      expect(result).to.be.instanceOf(Object);
      expect(result).to.have.property('_id').to.be.a('string').eq(idColor);
      expect(result).to.have.property('createdAt').to.be.a('number');
      expect(result).to.have.property('updatedAt').to.be.a('number');
      expect(result).to.have.property('cid').to.be.a('string');
      expect(result).to.have.property('label').to.be.a('string');
      expect(result).to.have.property('name').to.be.a('string');
      expect(result).to.have.property('value').to.be.a('string');
      expect(result).to.have.property('source').to.be.a('object');
      expect(result).to.have.property('userId').to.be.a('string');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('col001');
    }
  });
  it('should be able to delete a color', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idColor).to.be.a('string');
    const result = await sdk.color.deleteById(idColor);
    expect(result).eq('Success.');
  });
});
