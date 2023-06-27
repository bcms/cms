module.exports = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  local: true,
  jwt: {
    scope: 'localhost',
    secret: 'secret',
    expireIn: 60000,
  },
  database: {
    prefix: process.env.DB_PRFX || 'bcms',
    mongodb:
      process.env.DB_HOST || process.env.DB_CLUSTER
        ? {
            selfHosted: process.env.DB_HOST
              ? {
                  host: process.env.DB_HOST,
                  port: process.env.DB_PORT
                    ? parseInt(process.env.DB_PORT, 10)
                    : 27017,
                  name: process.env.DB_NAME,
                  user: process.env.DB_USER,
                  password: process.env.DB_PASS,
                }
              : undefined,
            atlas: process.env.DB_CLUSTER
              ? {
                  name: process.env.DB_NAME,
                  user: process.env.DB_USER,
                  password: process.env.DB_PASS,
                  cluster: process.env.DB_CLUSTER,
                }
              : undefined,
          }
        : undefined,
    fs: true,
  },
  plugins: [],
  bodySizeLimit: 102400000000,
};
