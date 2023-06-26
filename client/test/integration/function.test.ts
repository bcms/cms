import { expect } from 'chai';
import { client, Env } from '../util';

describe('Entry handler', async () => {
  it('should call a public function', async () => {
    const result = await client.function.call(Env.publicFunctionName);
    expect(result)
      .to.be.a('object')
      .to.have.property('result')
      .to.eq('Hello from a public function.');
  });
  it('should call a private function', async () => {
    const result = await client.function.call(Env.functionName, {
      test: 'Test',
    });
    expect(result)
      .to.be.a('object')
      .to.have.property('result')
      .to.have.property('test')
      .to.eq('Test');
  });
});
