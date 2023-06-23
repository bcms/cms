import { Login, sdk } from '../util';

describe('Type converter', async () => {
  Login();
  it('should get all types converted to typescript', async () => {
    await sdk.typeConverter.getAll('typescript');
    // TODO: Check result

    // for (let i = 0; i < result.length; i++) {
    //   const item = result[i];
    //   try {
    //     await mkdir(path.join(__dirname, '_test'));
    //   } catch (error) {
    //     // Do nothing
    //   }
    //   await writeFile(
    //     path.join(__dirname, '_test', item.outputFile.replace(/\//g, '_')),
    //     item.content,
    //   );
    // }
  });
});
