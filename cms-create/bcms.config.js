const { createBcmsConfig } = require('@becomes/cms-backend/config');

module.exports = createBcmsConfig({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  local: true,
  jwt: {
    expireIn: process.env.JWT_EXP_AFTER
      ? parseInt(process.env.JWT_EXP_AFTER, 10)
      : 60000,
    scope: process.env.JWT_SCOPE || 'localhost',
    secret: process.env.JWT_SECRET || 'secret',
  },
  database: {
    prefix: process.env.DB_PRFX || 'bcms',
    fs: true,
  },
  plugins: [],
});
