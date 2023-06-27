import { expect } from 'chai';
import { sdk } from '../util';

describe('Throwable utility', async () => {
  it('should call success function', async () => {
    let ok = false;
    await sdk.util.throwable(
      async () => {
        return true;
      },
      async (result) => {
        ok = result;
      },
      async () => {
        ok = false;
      },
    );

    expect(ok).to.eq(true);
  });

  it('should call error function', async () => {
    let ok = '';
    await sdk.util.throwable(
      async () => {
        throw Error('This is error');
      },
      async () => {
        ok = '';
      },
      async (error) => {
        const err = error as Error;
        ok = err.message;
      },
    );

    expect(ok).to.eq('This is error');
  });
});
