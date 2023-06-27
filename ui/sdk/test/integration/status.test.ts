import { expect } from 'chai';
import { Login, ObjectUtil, sdk } from '../util';

describe('Status API', async () => {
  Login();
  let idFirstStatus: string;
  let idSecondStatus: string;
  it('should create new color', async () => {
    const firstStatus = await sdk.status.create({
      label: 'OK',
      color: '#030504',
    });
    idFirstStatus = firstStatus._id;
    expect(firstStatus).to.be.instanceOf(Object);
    expect(firstStatus).to.have.property('_id').to.be.a('string');
    expect(firstStatus).to.have.property('createdAt').to.be.a('number');
    expect(firstStatus).to.have.property('updatedAt').to.be.a('number');
    ObjectUtil.eq(
      firstStatus,
      {
        color: '#030504',
        label: 'OK',
        name: 'ok',
      },
      'status',
    );
    const secondStatus = await sdk.status.create({
      label: 'ERROR',
      color: '#030505',
    });
    idSecondStatus = secondStatus._id;
    expect(secondStatus).to.be.instanceOf(Object);
    expect(secondStatus).to.have.property('_id').to.be.a('string');
    expect(secondStatus).to.have.property('createdAt').to.be.a('number');
    expect(secondStatus).to.have.property('updatedAt').to.be.a('number');
    ObjectUtil.eq(
      secondStatus,
      {
        color: '#030505',
        label: 'ERROR',
        name: 'error',
      },
      'status',
    );
  });
  it('should be able to update status', async () => {
    const updateStatus = await sdk.status.update({
      _id: idFirstStatus,
      label: 'Entry',
      color: '#030506',
    });
    expect(updateStatus).to.be.instanceOf(Object);
    expect(updateStatus)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idFirstStatus);
    expect(updateStatus).to.have.property('createdAt').to.be.a('number');
    expect(updateStatus).to.have.property('updatedAt').to.be.a('number');
    ObjectUtil.eq(
      updateStatus,
      {
        color: '#030506',
        label: 'Entry',
        name: 'entry',
      },
      'status',
    );
  });
  it('should get all statuses', async () => {
    const allStatuses = await sdk.status.getAll();
    expect(allStatuses).to.be.a('array');
    expect(allStatuses.length).gte(0);
    for (let i = 0; i < allStatuses.length; i++) {
      const status = allStatuses[i];
      expect(status).to.be.instanceOf(Object);
      expect(status).to.have.property('_id').to.be.a('string');
      expect(status).to.have.property('createdAt').to.be.a('number');
      expect(status).to.have.property('updatedAt').to.be.a('number');
      expect(status).to.have.property('label').to.be.a('string');
      expect(status).to.have.property('name').to.be.a('string');
      expect(status).to.have.property('color').to.be.a('string');
    }
  });

  it('should get how many statuses are available', async () => {
    const status = await sdk.status.count();
    expect(status).to.be.a('number');
  });
  it('should get a status', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idSecondStatus).to.be.a('string');
    const status = await sdk.status.get(idSecondStatus);
    expect(status).to.be.instanceOf(Object);
    expect(status).to.have.property('_id').to.be.a('string');
    expect(status).to.have.property('createdAt').to.be.a('number');
    expect(status).to.have.property('updatedAt').to.be.a('number');
    expect(status).to.have.property('label').to.be.a('string');
    expect(status).to.have.property('name').to.be.a('string');
    expect(status).to.have.property('color').to.be.a('string');
  });
  it('should fail when trying to get a status which does not exist', async () => {
    try {
      const status = await sdk.status.get('6184f06acbf8c33bfe92b042');
      expect(status).to.be.instanceOf(Object);
      expect(status).to.have.property('_id').to.be.a('string');
      expect(status).to.have.property('createdAt').to.be.a('number');
      expect(status).to.have.property('updatedAt').to.be.a('number');
      expect(status).to.have.property('label').to.be.a('string');
      expect(status).to.have.property('name').to.be.a('string');
      expect(status).to.have.property('color').to.be.a('string');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('sts001');
    }
  });
  it('should delete a status', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idSecondStatus).to.be.a('string');
    const result = await sdk.status.deleteById(idSecondStatus);
    expect(result).eq('Success.');
  });
  it('should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idFirstStatus).to.be.a('string');
    const result = await sdk.status.deleteById(idFirstStatus);
    expect(result).eq('Success.');
  });
});
