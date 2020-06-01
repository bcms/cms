import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import { Job, JobCron } from './interfaces/job';
import { ConsoleColors, Logger } from 'purple-cheetah';

export class JobsManagerService {
  private static logger: Logger = new Logger('JobsManagerService');
  private static jobs: Job[] = [];

  public static async init() {
    const jobsDirPath = path.join(process.env.PROJECT_ROOT, 'jobs');
    if ((await util.promisify(fs.exists)(jobsDirPath)) === false) {
      return;
    }
    const files = await util.promisify(fs.readdir)(jobsDirPath);
    files.filter((file) => file.endsWith('.js'));
    for (const i in files) {
      const fileParts = files[i].split('.');
      const name = fileParts.slice(0, fileParts.length - 1).join('.');
      const script = require(path.join(jobsDirPath, files[i]));
      if (typeof script.config !== 'object') {
        throw new Error(
          `
        ${ConsoleColors.FgRed}Job "${name}" does not have a "config" ` +
            `variable exported. Please add:
        ${ConsoleColors.FgGreen}exports.config = {
          type: 'interval' | 'date';
          value: number | string;
        }
        ${ConsoleColors.Reset}
        `,
        );
      }

      if (script.config.type === 'interval') {
        if (typeof script.config.value !== 'number') {
          throw new Error(`
          ${ConsoleColors.FgRed}
          Invalid value "${script.config.value}" was provided in Job "${name}".
          ${ConsoleColors.Reset}`);
        }
      } else if (script.config.type === 'cron') {
        if (typeof script.config.value !== 'string') {
          throw new Error(`
          ${ConsoleColors.FgRed}
          Invalid value "${script.config.value}" was provided in Job "${name}".
          ${ConsoleColors.Reset}`);
        }
        script.config.value = this.parseCron(script.config.value);
      } else {
        throw new Error(`
          ${ConsoleColors.FgRed}
          Invalid type "${script.config.type}" was provided in Job "${name}".
          ${ConsoleColors.Reset}`);
      }
      this.jobs.push({
        name,
        type: script.config.type,
        value: script.config.value,
        handler: script.handler,
      });
    }
    this.jobs.forEach((job) => {
      if (job.type === 'interval') {
        job.timer = setInterval(() => {
          job.handler().catch((error) => {
            this.logger.error(job.name, {
              message: 'Job failed. Removing it from execution queue.',
              error,
            });
            clearInterval(job.timer);
          });
        }, job.value as number);
      }
    });
  }

  private static parseCron(cronString: string) {
    const parts = cronString.split(' ');
    if (parts.length !== 5) {
      throw new Error(`
      ${ConsoleColors.FgRed}
      Invalid value format "${cronString}" in Job "${name}" for cronjob.
      ${ConsoleColors.Reset}`);
    }
    const cron: JobCron = {
      dayM: [],
      dayW: [],
      hour: [],
      minute: [],
      month: [],
    };
  }
}
