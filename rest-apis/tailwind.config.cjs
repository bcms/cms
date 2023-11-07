const config = require('../ui/tailwind.config.cjs');

config.purge.content.push(
  '../ui/src/index.html',
  '../ui/public/**/*.html',
  '../ui/src/**/*.{vue,js,ts,jsx,tsx}'
);

module.exports = config;
