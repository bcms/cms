import type { BCMSFunction } from '../types';

export function createBcmsFunction<Payload>(
  fn: () => Promise<BCMSFunction<Payload>>,
): () => Promise<BCMSFunction<Payload>> {
  return fn;
  // const objectUtil = useObjectUtility();
  // const checkModel = objectUtil.compareWithSchema(
  //   config,
  //   BCMSFunctionSchema,
  //   'function',
  // );
  // if (checkModel instanceof ObjectUtilityError) {
  //   throw Error(checkModel.message);
  // }
  // return config;
}
