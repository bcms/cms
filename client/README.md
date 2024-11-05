# BCMS client library

Getting and pushing data to the BCMS made easy. BCMS Client uses Api key to
access data in your BCMS. You can use this library instead of making HTTP
requests to your BCMS Instance.

## Getting started

Install the client (we are using [GitHub packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package) so you will need to setup your project for them):

```bash
npm i --save @bcms/selfhosted-client
```

Initialize the client instance:

```ts
import { Client } from '@bcms/selfhosted-client';

const bcms = new Client(
    'BCMS_ORIGIN', // ex. https://my-bcms-domain.com
    {
        // API Key is generated in BCMS Dashboard
        id: 'API_KEY_ID',
        secret: 'API_KEY_SECRET'
    },
    {
        injectSvg: true, // If media is of type SVG, content fill be injected in the media object
        enableSocket: true, // Receive updates from BCMS
        useMemCache: true, // Cache BCMS responses
    }
);
```

Have in mind that API Keys are scoped and you can set permissions in the BCMS Dashboard.

### [API Reference](https://bcms.github.io/cms/client/)

In progress ...