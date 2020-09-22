import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as chokidar from 'chokidar';
import * as uuid from 'uuid';
import { Fn, FnType } from './interfaces/function.interface';
import { ConsoleColors, FSUtil } from 'purple-cheetah';

export class FunctionsConfig {
  public static functions: Array<Fn & { path: string }> = [];
  private static watching = false;

  private static watch() {
    chokidar
      .watch(path.join(process.cwd(), 'functions'), {
        persistent: true,
      })
      .on('change', async (location) => {
        const hash = uuid.v4();
        const file = await FSUtil.read(location);
        await FSUtil.save(file, `${location}-${hash}`);
        await this.load(location, `${location}-${hash}`);
        await FSUtil.deleteFile(`${location}-${hash}`);
      });
  }

  private static async load(originalLocation: string, location: string) {
    const originalFn = this.functions.find((e) => e.path === originalLocation);
    const file = await import(location);
    const fn = this.verifyFile('temp', file);
    if (!fn) {
      return;
    }
    this.functions = this.functions.filter((e) => e.name !== originalFn.name);
    this.functions.push({
      path: originalLocation,
      name: originalFn.name,
      type: originalFn.type,
      resolve: fn.resolve,
    });
  }

  private static verifyFile(name: string, file: any) {
    if (!file.resolve) {
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
    if (file.type) {
      if (!FnType[file.type]) {
        throw new Error(
          `Function cannot be of type "${file.type}" - ` +
            `Problem in function "${name}"`,
        );
      }
      type = file.type;
    }
    return {
      name,
      type,
      resolve: file.resolve,
    };
  }

  public static clear() {
    FunctionsConfig.functions = [];
  }

  public static async init() {
    if (process.env.DEV && this.watching === false) {
      this.watching = true;
      this.watch();
    }
    const p = path.join(process.env.PROJECT_ROOT, 'functions');
    if ((await util.promisify(fs.exists)(p)) === true) {
      const files = await util.promisify(fs.readdir)(p);
      files
        .filter(async (file) => file.endsWith('.js'))
        .forEach(async (file) => {
          const fileParts = file.split('.');
          const name = fileParts.slice(0, fileParts.length - 1).join('.');
          const req = await import(path.join(p, file));
          const fn = this.verifyFile(name, req);
          if (!fn) {
            return;
          }
          this.functions.push({
            path: path.join(p, file),
            name,
            type: fn.type,
            resolve: fn.resolve,
          });
          // if (!req.resolve) {
          //   throw new Error(
          //     `

          //   ${ConsoleColors.FgRed}Function "${name}" does not have a "resolve" ` +
          //       `function exported. Please add:
          //   ${ConsoleColors.FgGreen}exports.resolve = async (request, event) => {
          //     // Your code ...
          //   }
          //   ${ConsoleColors.Reset}
          //   `,
          //   );
          // }
          // let type = FnType.STANDALONE;
          // if (req.type) {
          //   if (!FnType[req.type]) {
          //     throw new Error(
          //       `Function cannot be of type "${req.type}" - ` +
          //         `Problem in function "${name}"`,
          //     );
          //   }
          //   type = req.type;
          // }
          // FunctionsConfig.functions.push({
          //   name,
          //   type,
          //   resolve: req.resolve,
          // });
        });
    }
  }
}
