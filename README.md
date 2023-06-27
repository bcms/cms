# BCMS

[BCMS](thebcms.com) is a Headless CMS (Content Management System). It provides a powerful API, best-in-class model builder, and intuitive content editor.

## Table of contents

- [BCMS Cloud](#bcms-cloud)
  - [BCMS License](#bcms-license)
- [Terminology](#terminology)
- [Getting started](#getting-started)
- [Development and customization](development-and-customization)
  - [Functions](#functions)
  - [Events](#events)
  - [Jobs](#jobs)
  - [Plugins](#plugins)

## BCMS Cloud

The BCMS Cloud is a platform that provides a way to create and manage BCMS instances. It is used for issuing BCMS Licenses, managing BCMS Instances, and providing tools for organizations to manage teams and permissions efficiently. The BCMS is Open-Source and has both free and paid plans.

![Cloud connection](/assets/readme/fig2.png)

_Figure 1 - Connection between the BCMS Cloud and BCMS Instance._

Figure 1 whos that BCMS Instance runs outside of the BCMS Cloud. The BCMS Cloud only stores necessary data about users and essential data about the Instance, while all other data is stored in your database, and the BCMS Cloud does not have access to it. This means that the Instance owner is also the owner of all the data.

In Figure 1, you can see two arrows connecting the BCMS Cloud and the Instance. The first goes from Shim to the BCMS Cloud API gateway, while the other goes from the BCMS Cloud API gateway to the Nginx proxy on the Instance's server. Those two connections provide two-way communication between Shim and the BCMS Cloud. The BCMS License enables this communication.

### BCMS License

BCMS License is created by the BCMS Cloud when an Instance is created. A license has two roles:

- Proving the ownership over an Instance,
- Enabling secure communication between Shim and BCMS Cloud.

Every request to and from the Shim is first signed (using HMAC-SHA256) and then encrypted (using AES-256-GCM) using the License file. This provides secure data transfer over HTTP and is even safer over HTTPS. To see this implementation, please refer to [this file in the Shim repository](https://github.com/becomesco/cms-shim/blob/next/src/services/security.ts).

## Terminology

BCMS is a complex system, and it can be overwhelming to understand every part of it immediately. That's why we created BCMS in a way that allows developers to easily extend its functionality without knowing every detail of the software.

If you are not a developer, [user manual]() will be a good start for you to get started with BCMS quickly. (not yet available).

- [BCMS Backend](https://github.com/becomesco/cms-backend) - or the **backend**, refers to a Core BCMS module that handles common and custom backend tasks. Those tasks include communication with the database, database caching, scoping, restrictions and security, object aggregation and relational updates, real-time connection with sockets, and many more.
- [BCMS UI](https://github.com/becomesco/cms-ui) - or the **dashboard**, refers to a Core BCMS module that provides a beautiful CMS interface.
- [BCMS SDK](https://github.com/becomesco/cms-sdk) - or the **SDK**, refers to a Core BCMS module that provides a layer of abstraction between the UI and the backend. It handles caching, communication with the backend API, and data synchronization, among many other things. It is extended and used by the dashboard.

## Getting started

> Pre-requirements

- Make sure that [Node 14+](https://nodejs.org/en/) is installed on your system.
- Make sure that [Docker](https://www.docker.com/) is installed and running on your system.
- If you do not have it installed, install the [Docker Compose](https://docs.docker.com/compose/) tool first.

> Installation

- Install BCMS CLI: `npm i -g @becomes/cms-cli`
- Open a terminal and navigate to a place where you would like to create a project.
- Create a project by running: `bcms --cms create`.
- CD into the project and run `docker-compose up`.
- BCMS will be available on post 8080: http://localhost:8080
- Done.

## Development and customization

Custom features can be added to the BCMS in two ways: [by creating a plugin](#plugins), which is more advanced, or by creating [functions](#functions), [events](#events) and/or [jobs](#jobs). Extending BCMS functionality is limited but powerful. For example, you cannot modify core BCMS functionality but can build on top of it.

### Functions

BCMS Functions are JavaScript functions that can be executed by sending an HTTP request to the BCMS backend API. Once function is created, it will be available at `POST: /api/function/{FUNCTION_NAME}`. One use case for functions might be to create a contact form on a website. This function might send an email using an SMTP client (like [nodemailer](https://nodemailer.com/about/)) and can be called from the website using [BCMS Client](https://github.com/becomesco/cms-client).

> **Example**

Inside the `src/functions`, we can create a new file called `ping-pong.ts`. Inside of it, we will create a simple handler that will echo a request body and add `pong` property to it.

```ts
import { createBcmsFunction } from '@becomes/cms-backend/function';

export default createBcmsFunction(async () => {
  return {
    config: {
      name: 'ping-pong',
      public: true,
    },
    async handler({ request }) {
      return { ...request.body, pong: true };
    },
  };
});
```

After saving the file, our function will be available at `POST: http://localhost:8080/api/function/ping-pong`. Now, using the [Postman](https://www.postman.com/) we can send an HTTP request, like shown in Figure 2.

![Figure 2](/assets/readme/fig1.png)

_Figure 2 - Calling a BCMS function._

As you can see, BCMS functions are easy to create and simple to call. It is important to note that the function, which we have created above, is public. This means that anyone can call it without any authorization. Private functions (non-public functions) require authorization by signing the requests using an HTTP Signature. You can see how this works in the [BCMS Backend repository](https://github.com/becomesco/cms-backend/blob/master/src/security/api.ts) or its JavaScript implementation in the [BCMS Client repository](https://github.com/becomesco/cms-client/blob/master/src/util/security.ts).

### Events

As mentioned above, there is no direct way to modify a core functionality of the BCMS Backend. Because of this, all essential features will trigger an internal event called a BCMS Event. It can be an Entry event, Template event, Group event ([full list of events](https://github.com/becomesco/cms-backend/blob/master/src/types/event/config.ts))... All that is required to subscribe to an event is to create a file inside of the `src/events` directory.

> **Example**

```ts
import { createBcmsEvent } from '@becomes/cms-backend/event';
import {
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
} from '@becomes/cms-backend/types';

export default createBcmsEvent(async () => {
  return {
    config: {
      method: BCMSEventConfigMethod.ALL,
      scope: BCMSEventConfigScope.TEMPLATE,
    },
    async handler(data) {
      console.log('My event', data);
    },
  };
});
```

It is important to know that you can emit custom events using [BCMS Event Manager](https://github.com/becomesco/cms-backend/blob/master/src/types/event/manager.ts).

### Jobs

BCMS Jobs is a way to execute a custom code on the BCMS Backend at a specified interval. To create a job, all that is required is to create a file inside the `src/jobs` directory. Jobs are scheduled using Cron syntax.

> **Example**

```ts
import { createBcmsJob } from '@becomes/cms-backend/job';

export default createBcmsJob(async () => {
  return {
    cron: {
      dayOfMonth: '*',
      dayOfWeek: '*',
      hour: '*',
      minute: '*',
      month: '*',
    },
    async handler() {
      console.log('My job');
    },
  };
});
```

In the above example, **My job** will be printed in the console every minute.

### Plugins

BCMS Plugins are specifically bundled code that can extend the functionality of the BCMS backend and BCMS UI. For more information [visit plugin repository](https://github.com/becomesco/cms-plugin-starter).
