const { BCMSConfigBuilder } = require('@becomes/cms-bundler');

module.exports = BCMSConfigBuilder({
  /** Backend configuration */
  backend: {
    /** At which port will application run */
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 1280,
    security: {
      jwt: {
        /** Domain of the BCMS */
        issuer: process.env.JWT_ISSUER || 'localhost',
        /** For production use 256-bit encryption string */
        secret: process.env.JWT_SECRET || 'secret',
      },
    },
    /** Data base configuration. MongoDB and FSDB are available */
    database: process.env.PROD
      ? {
          /** Tell the backend to use MongoDB */
          mongodb: process.env.DB_CLUSTER
            ? {
                /** Use MongoDB Atlas */
                atlas: {
                  cluster: process.env.DB_CLUSTER,
                  name: process.env.DB_NAME,
                  user: process.env.DB_USER,
                  password: process.env.DB_PASSWORD,
                  prefix: 'bcms',
                },
              }
            : {
                /** Use MongoDB self-hosted */
                selfHosted: {
                  host: process.env.DB_HOST,
                  port: process.env.DB_PORT,
                  name: process.env.DB_NAME,
                  user: process.env.DB_USER,
                  password: process.env.DB_PASSWORD,
                  prefix: 'bcms',
                },
              },
        }
      : {
          /** Tell the backend to use FSDB */
          fs: 'bcms',
        },
  },
  /** List of BCMS Plugins */
  plugins: [],
});
