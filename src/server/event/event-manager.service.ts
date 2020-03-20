import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { Event, EventConfig, EventType, EventSource } from './interfaces/event.interface';
import { ConsoleColors } from 'purple-cheetah';

export class EventManagerService {
  private static events: Event[] = [];

  public static async init() {
    const p = path.join(process.env.PROJECT_ROOT, 'events');
    if ((await util.promisify(fs.exists)(p)) === true) {
      const files = await util.promisify(fs.readdir)(p);
      files
        .filter(file => file.endsWith('.js'))
        .forEach(file => {
          const fileParts = file.split('.');
          const name = fileParts.slice(0, fileParts.length - 1).join('.');
          const req = require(path.join(p, file));
          if (!req.handler) {
            throw new Error(
              `

            ${ConsoleColors.FgRed}Event "${name}" does not have a "handler" ` +
                `function exported. Please add:
            ${ConsoleColors.FgGreen}exports.handler = async (request, data) => {
              // Your code ...
            }
            ${ConsoleColors.Reset}
            `,
            );
          }
          if (!req.config) {
            throw new Error(
              `

            ${ConsoleColors.FgRed}Event "${name}" does not have a "config" ` +
                `object exported. Please add:
            ${ConsoleColors.FgYellow}/**
             * {
             *  source: EventSource;
             *  type: EventType;
             *  entryId?: string;
             *  templateId?: string;
             * }
             */
            exports.config = {}
            ${ConsoleColors.Reset}
            `,
            );
          }
          const config: EventConfig = req.config;
          if (typeof config.source !== 'string') {
            throw new Error(
              `${ConsoleColors.FgRed}Missing "source" in ` +
                `configuration for Event "${name}".`,
            );
          }
          if (!EventSource[config.source]) {
            throw new Error(
              `${ConsoleColors.FgRed}Invalid "source" ` +
                `value "${config.source}" in ` +
                `configuration for Event "${name}".`,
            );
          }
          if (typeof config.type !== 'string') {
            throw new Error(
              `${ConsoleColors.FgRed}Missing "type" in ` +
                `configuration for Event "${name}".`,
            );
          }
          if (!EventType[config.type]) {
            throw new Error(
              `${ConsoleColors.FgRed}Invalid "type" ` +
                `value "${config.type}" in ` +
                `configuration for Event "${name}".`,
            );
          }
          this.events.push({
            config,
            name,
            handler: req.handler,
          });
        });
    }
  }

  public static async invoke() {
    
  }
}
