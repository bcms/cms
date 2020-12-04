const { BCMSConfigBuilder } = require('@becomes/cms-bundler');

module.exports = BCMSConfigBuilder({
  backend: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 1280,
    security: {
      jwt: {
        issuer: process.env.JWT_ISSUER || 'localhost',
        secret: process.env.JWT_SECRET || 'secret',
      },
    },
    database: {
      fs: 'bcms',
    },
  },
  plugins: [],
});
