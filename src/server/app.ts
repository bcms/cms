import * as express from 'express';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';

import {
  Application,
  CORSMiddleware,
  RequestLoggerMiddleware,
  BodyParserMiddleware,
  EnableMongoDB,
  MongoDBConfig,
  PurpleCheetah,
} from '@becomes/purple-cheetah';
import { SwaggerController } from './swagger/controller';
import { SwaggerMiddleware } from './swagger/middleware';

let dbConfig: MongoDBConfig;
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
@EnableMongoDB(dbConfig)
@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [
    process.env.DEV === 'true' ? new SwaggerController() : undefined,
  ],
  middleware: [
    new CORSMiddleware(),
    new RequestLoggerMiddleware(),
    new BodyParserMiddleware(),
    process.env.DEV === 'true' ? new SwaggerMiddleware() : undefined,
  ],
})
export class App extends PurpleCheetah {
  protected start() {
    this.app.use(express.static(path.join(process.cwd(), 'public')));
    this.app.use(
      express.static(
        path.join(
          __dirname,
          process.env.DEV === 'true' ? '..' : '',
          'frontend',
          'public',
          'bundle',
        ),
      ),
    );
  }

  protected finalize() {
    this.app.use(
      '/',
      async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction,
      ) => {
        if (request.path.startsWith('/api')) {
          next();
        }
        if (
          request.path.startsWith('/login') ||
          request.path.startsWith('/dashboard') ||
          request.path.startsWith('/create-admin')
        ) {
          response.status(200);
        } else {
          response.status(404);
        }
        if (process.env.DEV === 'true') {
          response.sendFile(
            path.join(
              __dirname,
              '..',
              'frontend',
              'public',
              'bundle',
              'index.html',
            ),
          );
        } else {
          if (
            (await util.promisify(fs.exists)(
              path.join(process.cwd(), 'public', 'index.html'),
            )) === true
          ) {
            response.sendFile(
              path.join(process.env.PROJECT_ROOT, 'public', 'index.html'),
            );
          } else {
            response.sendFile(
              path.join(
                __dirname,
                'frontend',
                'public',
                'bundle',
                'index.html',
              ),
            );
          }
        }
      },
    );
  }
}
