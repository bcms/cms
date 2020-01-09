module.exports = {
  server: {
    port: 1280,
    security: {
      jwt: {
        secret: 'jwt-256-bit-secret',
        issuer: 'localhost',
      }
    },
    database: {
      type: 'MONGO_SELF_HOSTED',
      mongo: {
        database: {
          host: 'localhost',
          port: 27017,
          name: 'bcms_db',
          user: 'bcms',
          pass: 'my-db-password',
          prefix: 'bcms',
        }
      }
    },
    github: {
      username: 'github-username',
      password: 'github-password',
    },
    env: {},
  }
}