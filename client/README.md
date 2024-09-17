# BCMS client library

Getting and pushing data to the BCMS made easy. BCMS Client uses Api key to
access data in your BCMS. You can use this library instead of making HTTP
requests to your BCMS Instance.

## Getting started

Install the client:

```bash
npm i --save @bcms/selfhosted-client
```

Initialize the client instance:

```ts
import { Client } from '@bcms/selfhosted-client';

const bcms = new Client(
    'BCMS_ORIGIN', // ex. https://my-bcms-domain.com
    {
        id: 'API_KEY_ID',
        secret: 'API_KEY_SECRET'
    },
    {
        injectSvg: true, // If media is of type SVG, content fill be injected in the media object
        enableSocket: true, // Receive updates from BCMS
        useMemCache: true, // Cache BCMS responses
    }
);

const templates = await bcms.template.getAll();
console.log(templates);
```
