import { expect } from 'chai';
import { Login, ObjectUtil, sdk } from '../util';

describe('Language API', async () => {
  Login();
  let idFirstLanguage: string;
  let idSecondLanguage: string;
  it('should create new languages', async () => {
    const FirstLanguage = await sdk.language.create({
      code: 'gr',
      name: 'German',
      nativeName: 'German',
    });
    idFirstLanguage = FirstLanguage._id;
    expect(FirstLanguage).to.be.instanceOf(Object);
    expect(FirstLanguage).to.have.property('_id').to.be.a('string');
    expect(FirstLanguage).to.have.property('createdAt').to.be.a('number');
    expect(FirstLanguage).to.have.property('updatedAt').to.be.a('number');
    expect(FirstLanguage).to.have.property('def').to.be.a('boolean');
    ObjectUtil.eq(
      FirstLanguage,
      {
        code: 'gr',
        name: 'German',
        nativeName: 'German',
        userId: '111111111111111111111111',
      },
      'language',
    );
    const SecondLanguage = await sdk.language.create({
      code: 'fr',
      name: 'French',
      nativeName: 'French',
    });
    idSecondLanguage = SecondLanguage._id;
    expect(SecondLanguage).to.be.instanceOf(Object);
    expect(SecondLanguage).to.have.property('_id').to.be.a('string');
    expect(SecondLanguage).to.have.property('createdAt').to.be.a('number');
    expect(SecondLanguage).to.have.property('updatedAt').to.be.a('number');
    expect(SecondLanguage).to.have.property('def').to.be.a('boolean');
    ObjectUtil.eq(
      SecondLanguage,
      {
        code: 'fr',
        name: 'French',
        nativeName: 'French',
        userId: '111111111111111111111111',
      },
      'language',
    );
  });
  it('should get all languages', async () => {
    const allLanguages = await sdk.language.getAll();
    expect(allLanguages).to.be.a('array');
    expect(allLanguages.length).gte(0);
    for (let i = 0; i < allLanguages.length; i++) {
      const language = allLanguages[i];
      expect(language).to.be.instanceOf(Object);
      expect(language).to.have.property('_id').to.be.a('string');
      expect(language).to.have.property('createdAt').to.be.a('number');
      expect(language).to.have.property('updatedAt').to.be.a('number');
      expect(language).to.have.property('code').to.be.a('string');
      expect(language).to.have.property('name').to.be.a('string');
      expect(language).to.have.property('nativeName').to.be.a('string');
      expect(language).to.have.property('def').to.be.a('boolean');
    }
  });
  it('should get how many languages are available', async () => {
    const result = await sdk.language.count();
    expect(result).to.be.a('number');
  });
  it('should be able to get language', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idSecondLanguage).to.be.a('string');
    const language = await sdk.language.get(idSecondLanguage);
    expect(language).to.be.instanceOf(Object);
    expect(language)
      .to.have.property('_id')
      .to.be.a('string')
      .eq(idSecondLanguage);
    expect(language).to.have.property('createdAt').to.be.a('number');
    expect(language).to.have.property('updatedAt').to.be.a('number');
    expect(language).to.have.property('code').to.be.a('string');
    expect(language).to.have.property('name').to.be.a('string');
    expect(language).to.have.property('nativeName').to.be.a('string');
    expect(language).to.have.property('def').to.be.a('boolean');
  });
  it('should fail when trying to get a language which does not exist', async () => {
    try {
      const language = await sdk.language.get('6184f06acbf8c33bfe92b042');
      expect(language).to.be.instanceOf(Object);
      expect(language)
        .to.have.property('_id')
        .to.be.a('string')
        .eq(idSecondLanguage);
      expect(language).to.have.property('createdAt').to.be.a('number');
      expect(language).to.have.property('updatedAt').to.be.a('number');
      expect(language).to.have.property('code').to.be.a('string');
      expect(language).to.have.property('name').to.be.a('string');
      expect(language).to.have.property('nativeName').to.be.a('string');
      expect(language).to.have.property('def').to.be.a('boolean');
    } catch (error) {
      expect(error).to.be.an('object').to.have.property('code').to.eq('lng001');
    }
  });
  it('should delete a language', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idSecondLanguage).to.be.a('string');
    const result = await sdk.language.deleteById(idSecondLanguage);
    expect(result).eq('Success.');
  });
  it('should clear test data', async () => {
    // eslint-disable-next-line no-unused-expressions
    expect(idFirstLanguage).to.be.a('string');
    const result = await sdk.language.deleteById(idFirstLanguage);
    expect(result).eq('Success.');
  });
});
