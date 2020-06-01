import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { Fn, FnType } from './interfaces/function.interface';
import { ConsoleColors } from 'purple-cheetah';

export class FunctionsConfig {
  public static functions: Fn[] = [];

  public static clear() {
    FunctionsConfig.functions = [];
  }

  public static async init() {
    const p = path.join(process.env.PROJECT_ROOT, 'functions');
    if ((await util.promisify(fs.exists)(p)) === true) {
      const files = await util.promisify(fs.readdir)(p);
      files
        .filter((file) => file.endsWith('.js'))
        .forEach((file) => {
          const fileParts = file.split('.');
          const name = fileParts.slice(0, fileParts.length - 1).join('.');
          const req = require(path.join(p, file));
          if (!req.resolve) {
            throw new Error(
              `

            ${ConsoleColors.FgRed}Function "${name}" does not have a "resolve" ` +
                `function exported. Please add:
            ${ConsoleColors.FgGreen}exports.resolve = async (request, event) => {
              // Your code ...
            }
            ${ConsoleColors.Reset}
            `,
            );
          }
          let type = FnType.STANDALONE;
          if (req.type) {
            if (!FnType[req.type]) {
              throw new Error(
                `Function cannot be of type "${req.type}" - ` +
                  `Problem in function "${name}"`,
              );
            }
            type = req.type;
          }
          FunctionsConfig.functions.push({
            name,
            type,
            resolve: req.resolve,
          });
        });
    }
  }
}
