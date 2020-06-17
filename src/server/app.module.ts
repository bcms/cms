import * as express from 'express';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';

import {
  Application,
  CorsMiddleware,
  RequestLoggerMiddleware,
  BodyParserMiddleware,
  Logger,
  Middleware,
  ExceptionHandlerMiddleware,
  EnableMongoose,
} from 'purple-cheetah';

import { ExceptionHandler } from 'purple-cheetah/interfaces/exception-handler.interface';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import { TemplateController } from './template/template.controller';
import { EntryController } from './entry/entry.controller';
import { MediaController } from './media/media.controller';
import { GroupController } from './group/group.controller';
import { MulterMediaMiddleware } from './media/middleware/multer.middleware';
import { KeyController } from './api/key.controller';
import { Config } from './config';
import { WidgetController } from './widget/widget.controller';
import { FunctionController } from './function/function.controller';
import { LanguageController } from './languages/language.controller';
import { WebhookController } from './webhook/webhook.controller';

let dbConfig: any;
if (process.env.DB_CLUSTER && process.env.DB_CLUSTER !== 'undefined') {
  dbConfig = {
    atlas: {
      db: {
        cluster: process.env.DB_CLUSTER,
        name: process.env.DB_NAME,
        readWrite: true,
      },
      user: {
        name: process.env.DB_USER,
        password: process.env.DB_PASS,
      },
    },
  };
} else {
  dbConfig = {
    selfHosted: {
      db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        name: process.env.DB_NAME,
      },
      user: {
        name: process.env.DB_USER,
        password: process.env.DB_PASS,
      },
    },
  };
}

/**
 * Application Module that starts all dependencies and
 * handles HTTP requests.
 */
@EnableMongoose(dbConfig)
@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [
    new UserController(),
    new AuthController(),
    new TemplateController(),
    new EntryController(),
    new MediaController(),
    new GroupController(),
    new KeyController(),
    new WidgetController(),
    new FunctionController(),
    new LanguageController(),
    new WebhookController(),
  ],
  middleware: [
    new CorsMiddleware(),
    new RequestLoggerMiddleware(),
    new BodyParserMiddleware(
      process.env.INCOMING_BODY_LIMIT
        ? {
            limit: process.env.INCOMING_BODY_LIMIT,
          }
        : undefined,
    ),
    new MulterMediaMiddleware(),
  ],
  exceptionHandlers: [],
})
export class App {
  private app: express.Application;
  private logger: Logger;
  private controllers: any[];
  private middleware: Middleware[];
  private exceptionHandlers: ExceptionHandler[];
  public listen: () => void;

  constructor() {
    Config.init();
    this.logger = new Logger('App');
    Logger.setLogPath(path.join(process.env.PROJECT_ROOT, 'log'));

    this.controllers.forEach((controller) => {
      controller.initRouter();
    });

    this.initializeMiddleware(this.middleware);
    this.initializeControllers(this.controllers);
  }

  private initializeMiddleware(middleware: Middleware[]) {
    middleware.forEach((e) => {
      if (e.uri) {
        if (e.handler instanceof Array) {
          e.handler.forEach((h) => {
            this.app.use(e.uri, h);
          });
        } else {
          this.app.use(e.uri, e.handler);
        }
      } else {
        this.app.use(e.handler);
      }
    });
  }

  private initializeControllers(controllers: any[]) {
    this.app.use(express.static(path.join(process.env.PROJECT_ROOT, 'public')));
    if (process.env.DEV === 'false') {
      this.app.use(express.static(path.join(__dirname, 'frontend')));
    } else {
      this.app.use(
        express.static(path.join(__dirname, '..', 'frontend', 'public')),
      );
    }
    controllers.forEach((controller) => {
      this.app.use(controller.baseUri, controller.router);
      this.logger.info('.controller', `[${controller.name}] mapping done.`);
    });
    this.exceptionHandlers.forEach((e) => {
      this.app.use(e.handler);
      this.logger.info('.exceptionHandler', `[${e.name}] mapping done.`);
    });
    this.app.use(new ExceptionHandlerMiddleware().handler);
    this.app.use(
      '/',
      async (request: express.Request, response: express.Response) => {
        if (
          request.path.startsWith('/login') ||
          request.path.startsWith('/dashboard') ||
          request.path.startsWith('/create-admin') ||
          request.path.startsWith('/dashboard/custom')
        ) {
          response.status(200);
        } else {
          response.status(404);
        }
        if (process.env.DEV === 'true') {
          response.sendFile(
            path.join(__dirname, '..', '..', 'public', 'index.html'),
          );
        } else {
          if (
            process.env.CUSTOM_FRONT_PATH &&
            request.path.startsWith('/dashboard/custom')
          ) {
            if (
              (await util.promisify(fs.exists)(
                path.join(process.env.PROJECT_ROOT, 'public', 'index.html'),
              )) === true
            ) {
              response.sendFile(
                path.join(
                  process.env.PROJECT_ROOT,
                  'public',
                  'custom',
                  'index.html',
                ),
              );
              return;
            }
          }
          if (
            (await util.promisify(fs.exists)(
              path.join(process.env.PROJECT_ROOT, 'public', 'index.html'),
            )) === true
          ) {
            response.sendFile(
              path.join(process.env.PROJECT_ROOT, 'public', 'index.html'),
            );
          } else {
            response.sendFile(path.join(__dirname, 'frontend', 'index.html'));
          }
        }
      },
    );
  }
}
