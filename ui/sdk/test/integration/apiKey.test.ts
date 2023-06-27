import { expect } from 'chai';
import { Login, ObjectUtil, sdk } from '../util';

describe('API Key API', async () => {
  Login();
  let idFirstKey: string;
  let idSecondKey: string;

  it('should create new API Key', async () => {
    const firstKey = await sdk.apiKey.create({
      access: {
        functions: [],
        templates: [],
      },
      blocked: false,
      desc: 'This is test key',
      name: 'Test key',
    });
    idFirstKey = firstKey._id;
    expect(firstKey).to.be.instanceOf(Object);
    expect(firstKey).to.have.property('_id').to.be.a('string');
    expect(firstKey).to.have.property('createdAt').to.be.a('number');
    expect(firstKey).to.have.property('updatedAt').to.be.a('number');
    expect(firstKey).to.have.property('secret').to.be.a('string');
    ObjectUtil.eq(
      firstKey,
      {
        access: { functions: [], templates: [] },
        blocked: false,
        desc: 'This is test key',
        name: 'Test key',
        userId: '111111111111111111111111',
      },
      'apiKey',
    );
    const secondKey = await sdk.apiKey.create({
      access: {
        functions: [],
        templates: [],
      },
      blocked: false,
      desc: 'This is test key 2',
      name: 'Test key 2',
    });
    idSecondKey = secondKey._id;
    expect(secondKey).to.be.instanceOf(Object);
    expect(secondKey).to.have.property('_id').to.be.a('string');
    expect(secondKey).to.have.property('createdAt').to.be.a('number');
    expect(secondKey).to.have.property('updatedAt').to.be.a('number');
    expect(secondKey).to.have.property('secret').to.be.a('string');
    ObjectUtil.eq(
      secondKey,
      {
        access: { functions: [], templates: [] },
        blocked: false,
        desc: 'This is test key 2',
        name: 'Test key 2',
        userId: '111111111111111111111111',
      },
      'apiKey',
    );
  });
  it('should be able to update API Key', async () => {
    const updateKey = await sdk.apiKey.update({
      _id: idFirstKey,
      access: {
        functions: [],
        templates: [],
      },
      blocked: false,
      desc: 'This is update key',
      name: 'Update key',
    });
    expect(updateKey).to.be.instanceOf(Object);
    expect(updateKey).to.have.property('_id').to.be.a('string').eq(idFirstKey);
    expect(updateKey).to.have.property('createdAt').to.be.a('number');
    expect(updateKey).to.have.property('updatedAt').to.be.a('number');
    expect(updateKey).to.have.property('secret').to.be.a('string');
    ObjectUtil.eq(
      updateKey,
      {
        access: { functions: [], templates: [] },
        blocked: false,
        desc: 'This is update key',
        name: 'Update key',
        userId: '111111111111111111111111',
      },
      'apiKey',
    );
  });
  it('should get all API Keys', async () => {
    const allKeys = await sdk.apiKey.getAll();
    expect(allKeys).to.be.a('array');
    expect(allKeys.length).gte(0);
    for (let i = 0; i < allKeys.length; i++) {
      const apiKey = allKeys[i];
      expect(apiKey).to.be.instanceOf(Object);
      expect(apiKey).to.have.property('_id').to.be.a('string');
      expect(apiKey).to.have.property('createdAt').to.be.a('number');
      expect(apiKey).to.have.property('updatedAt').to.be.a('number');
      expect(apiKey).to.have.property('secret').to.be.a('string');
      expect(apiKey).to.have.property('access').to.be.a('object');
      expect(apiKey).to.have.property('blocked').to.be.a('boolean');
      expect(apiKey).to.have.property('desc').to.be.a('string');
      expect(apiKey).to.have.property('name').to.be.a('string');
      expect(apiKey).to.have.property('userId').to.be.a('string');
    }
  });
  it('should get how many API Key are available', async () => {
    const result = await sdk.apiKey.count();
    expect(result).to.be.a('number');
  });
  it('should get an API Key', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idSecondKey).to.be.a('string');
    const apiKey = await sdk.apiKey.get(idSecondKey);
    expect(apiKey).to.be.instanceOf(Object);
    expect(apiKey).to.have.property('_id').to.be.a('string').eq(idSecondKey);
    expect(apiKey).to.have.property('createdAt').to.be.a('number');
    expect(apiKey).to.have.property('updatedAt').to.be.a('number');
    expect(apiKey).to.have.property('secret').to.be.a('string');
    expect(apiKey).to.have.property('access').to.be.a('object');
    expect(apiKey).to.have.property('blocked').to.be.a('boolean');
    expect(apiKey).to.have.property('desc').to.be.a('string');
    expect(apiKey).to.have.property('name').to.be.a('string');
    expect(apiKey).to.have.property('userId').to.be.a('string');
  });
  it('should fail when trying to get an API Key which does not exist', async () => {
    try {
      const apiKey = await sdk.apiKey.get('6184f06acbf8c33bfe92b042');
      expect(apiKey).to.be.instanceOf(Object);
      expect(apiKey).to.have.property('_id').to.be.a('string').eq(idSecondKey);
      expect(apiKey).to.have.property('createdAt').to.be.a('number');
      expect(apiKey).to.have.property('updatedAt').to.be.a('number');
      expect(apiKey).to.have.property('secret').to.be.a('string');
      expect(apiKey).to.have.property('access').to.be.a('object');
      expect(apiKey).to.have.property('blocked').to.be.a('boolean');
      expect(apiKey).to.have.property('desc').to.be.a('string');
      expect(apiKey).to.have.property('name').to.be.a('string');
      expect(apiKey).to.have.property('userId').to.be.a('string');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('ak001');
    }
  });
  it('should delete a API Key', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idSecondKey).to.be.a('string');
    const result = await sdk.apiKey.deleteById(idSecondKey);
    expect(result).eq('Success.');
  });
  it('should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idFirstKey).to.be.a('string');
    const result = await sdk.apiKey.deleteById(idFirstKey);
    expect(result).eq('Success.');
  });
});
