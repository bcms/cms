import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { Request } from 'express';

export class FunctionsConfig {
  public static functions: Array<{
    name: string;
    resolve: (request: Request) => Promise<any>;
  }> = [];

  public static clear() {
    FunctionsConfig.functions = [];
  }

  public static async init() {
    const p = path.join(process.env.PROJECT_ROOT, 'functions');
    const files = await util.promisify(fs.readdir)(p);
    files.forEach(file => {
      FunctionsConfig.functions.push({
        name: file.split('.')[0],
        resolve: require(path.join(p, file)).resolve,
      });
    });
  }
}
