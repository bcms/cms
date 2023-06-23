import { expect } from 'chai';
import { sdk } from '../util';

describe('String utility', async () => {
  it('should convert "test_string" into "Test String"', async () => {
    const result = sdk.util.string.toPretty('test_string');
    expect(result).to.be.eq('Test String');
  });
  it('should convert "#test-string" into "Test String"', async () => {
    const result = sdk.util.string.toPretty('#test-string');
    expect(result).to.be.eq('Test String');
  });
  it('should convert "Test@ String" into "test-string"', async () => {
    const result = sdk.util.string.toSlug('Test@ String');
    expect(result).to.be.eq('test-string');
  });
  it('should convert "Test@ String" into "test_string"', async () => {
    const result = sdk.util.string.toSlugUnderscore('Test@ String');
    expect(result).to.be.eq('test_string');
  });
  it('should convert "Test@ String" into "TEST_STRING', async () => {
    const result = sdk.util.string.toEnum('Test@ String');
    expect(result).to.be.eq('TEST_STRING');
  });
  it('should convert "This is test string" into "Thi ... ing"', async () => {
    const result = sdk.util.string.toShort('This is test string', 6);
    expect(result).to.be.eq('Thi ... ing');
  });
  it('should get text between 2 string', async () => {
    const result = sdk.util.string.textBetween(
      'This is test.',
      'This',
      'test.',
    );
    expect(result).to.be.eq(' is ');
  });
  it('should get all text between 2 string', async () => {
    const result = sdk.util.string.allTextBetween(
      'This is, some example text, that can be used to test, allTextBetween function.',
      'This is',
      ' allTextBetween function.',
    );
    expect(result[0]).to.be.eq(
      ', some example text, that can be used to test,',
    );
  });
  it('should convert number 9 to "009"', async () => {
    const result = sdk.util.string.addZerosAtBeginning(9, 3);
    expect(result).to.be.eq('009');
  });
});
