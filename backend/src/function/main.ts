import * as path from 'path';
import { Module, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import {
  useFS,
  useObjectUtility,
  useStringUtility,
} from '@becomes/purple-cheetah';
import {
  BCMSFunction,
  BCMSFunctionManager,
  BCMSFunctionSchema,
} from '../types';
import { BCMSRepo } from '@backend/repo';

let functionManager: BCMSFunctionManager;

async function init() {
  let fns: BCMSFunction<unknown>[] = [];
  const fs = useFS();
  const objectUtil = useObjectUtility();
  const stringUtil = useStringUtility();
  const fnsPath = path.join(process.cwd(), 'functions');
  if (await fs.exist(fnsPath)) {
    const fnNames = await fs.readdir(fnsPath);
    for (let i = 0; i < fnNames.length; i++) {
      const fnName = fnNames[i];
      if (
        fnName.endsWith('.js') ||
        (!fnName.endsWith('.d.ts') && fnName.endsWith('.ts'))
      ) {
        const fnImport: {
          default: () => Promise<BCMSFunction<unknown>>;
        } = await import(path.join(fnsPath, fnName));
        const checkFn = objectUtil.compareWithSchema(
          { fn: fnImport.default },
          {
            fn: {
              __type: 'function',
              __required: true,
            },
          },
          fnName,
        );
        if (checkFn instanceof ObjectUtilityError) {
          throw Error(checkFn.message);
        }
        const fn = await fnImport.default();
        const checkObject = objectUtil.compareWithSchema(
          fn,
          BCMSFunctionSchema,
          fnName,
        );
        if (checkObject instanceof ObjectUtilityError) {
          throw Error(checkObject.message);
        }
        fn.config.name = stringUtil.toSlug(fn.config.name);
        if (fns.find((e) => e.config.name === fn.config.name)) {
          throw Error(
            `Duplicate of "${fn.config.name}" function.` +
              ' This is not allowed.',
          );
        }
        fns.push(fn);
      }
    }
  }
  functionManager = {
    clear() {
      fns = [];
    },
    get(name) {
      return fns.find((e) => e.config.name === name);
    },
    getAll() {
      return fns;
    },
  };

  /**
   * Fix API Keys
   */
  {
    const apiKeys = await BCMSRepo.apiKey.findAll();
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      let changes = false;
      let j = 0;
      while (j < apiKey.access.functions.length) {
        const fnName = apiKey.access.functions[j];
        const fnAvailable = functionManager.get(fnName.name);
        if (!fnAvailable || fnAvailable.config.public) {
          changes = true;
          apiKey.access.functions.splice(j, 1);
        } else {
          j++;
        }
      }
      if (changes) {
        await BCMSRepo.apiKey.update(apiKey);
      }
    }
  }
}

export function createBcmsFunctionModule(): Module {
  return {
    name: 'Function',
    initialize({ next }) {
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}

export function useBcmsFunctionManger(): BCMSFunctionManager {
  return functionManager;
}
