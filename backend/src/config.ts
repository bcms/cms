import * as path from 'path';
import { useObjectUtility } from '@becomes/purple-cheetah';
import {
  ObjectSchema,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';

export class BCMSConfig {
  /**
   * Port on which application will be started.
   */
  static port: number = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 8080;
  /**
   * Flag which indicates is backend should run in
   * local development mode.
   */
  static local?: boolean;
  /**
   * JSON Web Token configuration.
   */
  static jwt: {
    scope: string;
    secret: string;
    expireIn: number;
  } = {
    expireIn: 300000000,
    secret: 'secret',
    scope: 'localhost',
  };
  /**
   * Database configuration.
   */
  static database: {
    /**
     * Prefix string for database collections. For example, if
     * prefix is set to "projectName", all collections will start
     * with this string. So user collection will be called
     * "projectName_users", group collection "projectName_groups"
     * and so one.
     */
    prefix: string;
    /**
     * Use FSDB as the database. This is meant for development only.
     */
    fs?: boolean;
    /**
     * MongoDB database configuration.
     */
    mongodb?: {
      selfHosted?: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
      };
      atlas?: {
        name: string;
        user: string;
        password: string;
        cluster: string;
      };
    };
  } = {
    prefix: 'bcms',
    fs: true,
  };
  /**
   * Set maximum size of a request body. Defaults to 1MB
   */
  static bodySizeLimit?: number;
  /**
   * Plugin paths.
   * For example, if there is a Plugin called `test.js` in a
   * `src/plugins` directory, jobs array will
   * contain: ['src/plugins/test.js']
   */
  static plugins?: string[] = [];
  /**
   * Function paths.
   * For example, if there is a Function called `test.js` in a
   * `src/functions` directory, jobs array will
   * contain: ['src/functions/test.js']
   */
  static functions?: string[];
  /**
   * Event paths.
   * For example, if there is an Event called `test.js` in a
   * `src/events` directory, jobs array will contain: ['src/events/test.js']
   */
  static events?: string[];
  /**
   * Job paths.
   * For example, if there is a Job called `test.js` in a
   * `src/jobs` directory, jobs array will contain: ['src/jobs/test.js']
   */
  static jobs?: string[];
}

export const BCMSConfigSchema: ObjectSchema = {
  port: {
    __type: 'number',
    __required: true,
  },
  jwt: {
    __type: 'object',
    __required: true,
    __child: {
      scope: {
        __type: 'string',
        __required: true,
      },
      secret: {
        __type: 'string',
        __required: true,
      },
      expireIn: {
        __type: 'number',
        __required: true,
      },
    },
  },
  database: {
    __type: 'object',
    __required: true,
    __child: {
      prefix: {
        __type: 'string',
        __required: true,
      },
      fs: {
        __type: 'boolean',
        __required: false,
      },
      mongodb: {
        __type: 'object',
        __required: false,
        __child: {
          selfHosted: {
            __type: 'object',
            __required: false,
            __child: {
              host: {
                __type: 'string',
                __required: true,
              },
              port: {
                __type: 'number',
                __required: true,
              },
              name: {
                __type: 'string',
                __required: true,
              },
              user: {
                __type: 'string',
                __required: true,
              },
              password: {
                __type: 'string',
                __required: true,
              },
            },
          },
          atlas: {
            __type: 'object',
            __required: false,
            __child: {
              name: {
                __type: 'string',
                __required: true,
              },
              user: {
                __type: 'string',
                __required: true,
              },
              password: {
                __type: 'string',
                __required: true,
              },
              cluster: {
                __type: 'string',
                __required: true,
              },
            },
          },
        },
      },
    },
  },
  bodySizeLimit: {
    __type: 'number',
    __required: false,
  },
  plugins: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'string',
    },
  },
  functions: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'string',
    },
  },
  events: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'string',
    },
  },
  jobs: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'string',
    },
  },
};

export function createBcmsConfig(config: typeof BCMSConfig): BCMSConfig {
  return config;
}

export async function loadBcmsConfig(): Promise<void> {
  const configFile = await import(path.join(process.cwd(), 'bcms.config.js'));
  const objectUtil = useObjectUtility();
  const checkSchema = objectUtil.compareWithSchema(
    configFile,
    BCMSConfigSchema,
    'configFile',
  );
  if (checkSchema instanceof ObjectUtilityError) {
    throw Error(checkSchema.errorCode + ' ---> ' + checkSchema.message);
  }
  BCMSConfig.local = configFile.local;
  BCMSConfig.port = configFile.port;
  BCMSConfig.jwt = configFile.jwt;
  BCMSConfig.database = configFile.database;
  BCMSConfig.bodySizeLimit = configFile.bodySizeLimit;
  BCMSConfig.plugins = configFile.plugins;
}
