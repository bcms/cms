# Becomes CMS client library

[![NPM Version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/@becomes/cms-client.svg
[npm-url]: https://npmjs.org/package/@becomes/cms-client

This library provides an easy access to [BCMS API](https://github.com/becomesco/cms).

## Getting started

1. Install package from NPM: `npm i --save @becomes/cms-client`
2. Create a new Client instance and make a request to the BCMS:

```ts
import { createBcmsClient } from '@becomes/cms-client';

async function main() {
  /**
   * Creating a new instance of the Client object
   */
  const client = createBcmsClient({
    cmsOrigin:
      process.env.BCMS_API_ORIGIN ||
      'https://becomes-starter-projects.yourbcms.com',
    key: {
      id: process.env.BCMS_API_KEY || '629dcd4dbcf5017354af6fe8',
      secret:
        process.env.BCMS_API_KEY_SECRET ||
        '7a3c5899f211c2d988770f7561330ed8b0a4b2b5481acc2855bb720729367896',
    },
  });
  /**
   * Get an entry from the BCMS
   */
  const result = await client.entry.get({
    template: 'pages', // Template name or ID
    entry: 'home', // Entry slug or ID
  });
  console.log(result);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Development

- Clone the repository: `git clone git@github.com:becomesco/cms-client`,
- Install dependencies: `npm i`
