#!/usr/bin/env node

require = require('esm')(module /*, options */);
require('../cli.js').cli(process.argv);