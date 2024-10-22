export class BCMSConfig {
  /**
   * Port on which application will be started.
   */
  static port: number = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 8080;
  /**
   * JSON Web Token configuration.
   */
  static jwt: {
    scope: string;
    secret: string;
    expireIn: number;
  } = {
    expireIn: process.env.JWT_EXP_IN
      ? parseInt(process.env.JWT_EXP_IN, 10)
      : 300000000,
    secret: process.env.JWT_SECRET || 'secret',
    scope: process.env.JWT_SCOPE || 'localhost',
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
    prefix: process.env.DB_PREFIX || 'bcms',
    fs: !process.env.DB_NAME,
    mongodb: process.env.DB_NAME
      ? {
          atlas: process.env.DB_CLUSTER
            ? {
                name: process.env.DB_NAME || '',
                user: process.env.DB_USER || '',
                cluster: process.env.DB_CLUSTER || '',
                password: process.env.DB_PASS || '',
              }
            : undefined,
          selfHosted: process.env.DB_CLUSTER
            ? undefined
            : {
                host: process.env.DB_HOST || 'bcms-db',
                port: process.env.DB_PORT
                  ? parseInt(process.env.DB_PORT, 10)
                  : 27017,
                user: process.env.DB_USER || 'test',
                name: process.env.DB_NAME || 'admin',
                password: process.env.DB_PASS || 'test1234',
              },
        }
      : undefined,
  };
  /**
   * Set maximum size of a request body. Defaults to 1MB
   */
  static bodySizeLimit?: number = process.env.BODY_SIZE_LIMIT
    ? parseInt(process.env.BODY_SIZE_LIMIT, 10)
    : undefined;
  /**
   * Plugin paths.
   * For example, if there is a Plugin called `test.js` in a
   * `src/plugins` directory, jobs array will
   * contain: ['src/plugins/test.js']
   */
  static plugins?: string[] = process.env.PLUGINS
    ? process.env.PLUGINS.split(',')
    : undefined;
  /**
   * Function paths.
   * For example, if there is a Function called `test.js` in a
   * `src/functions` directory, jobs array will
   * contain: ['src/functions/test.js']
   */
  static functions?: string[] = process.env.FUNCTIONS
    ? process.env.FUNCTIONS.split(',')
    : undefined;
  /**
   * Event paths.
   * For example, if there is an Event called `test.js` in a
   * `src/events` directory, jobs array will contain: ['src/events/test.js']
   */
  static events?: string[] = process.env.EVENTS
    ? process.env.EVENTS.split(',')
    : undefined;
  /**
   * Job paths.
   * For example, if there is a Job called `test.js` in a
   * `src/jobs` directory, jobs array will contain: ['src/jobs/test.js']
   */
  static jobs?: string[] = process.env.JOBS
    ? process.env.JOBS.split(',')
    : undefined;
}

// export async function loadBcmsConfig(): Promise<void> {
//   const configFile = await import(path.join(process.cwd(), 'bcms.config.js'));
//   const objectUtil = useObjectUtility();
//   const checkSchema = objectUtil.compareWithSchema(
//     configFile,
//     BCMSConfigSchema,
//     'configFile',
//   );
//   if (checkSchema instanceof ObjectUtilityError) {
//     throw Error(checkSchema.errorCode + ' ---> ' + checkSchema.message);
//   }
//   BCMSConfig.local = configFile.local;
//   BCMSConfig.port = configFile.port;
//   BCMSConfig.jwt = configFile.jwt;
//   BCMSConfig.database = configFile.database;
//   BCMSConfig.bodySizeLimit = configFile.bodySizeLimit;
//   BCMSConfig.plugins = configFile.plugins;
// }
