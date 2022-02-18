# BCMS

BCMS is a CMS (Content Management System) created and developed by a company [Becomes](https://becomes.co). BCMS is a headless CMS and provides a great API, best in class model builder and intuitive content editor. It was created because of project needs in our company and we decided to make it Open-Source (we provide a free plan) since it solved a lot of problems that we had with other CMS solutions. We hope that you will find it useful in your next project.

## Table of contents

- [BCMS Cloud](#bcms-cloud)
- [Terminology](#terminology)
- [Getting started](#getting-started)
- [Development and customization](development-and-customization)
  - [Functions](#functions)
  - [Events](#events)
  - [Jobs](#jobs)
  - [Plugins](#plugins)

## Terminology

BCMS is a very complex system and it can be overwhelming to understand it in detail. Because of that, it is created in such a way that details are not required to successfully use and develop custom functionality for it. Depending on type of a thing that one needs to achieve, deeper understanding of the BCMS system might be required.

If reader of this document is not a developer, it should go to [user manual page]() (not yet available) because this document will not help with using BCMS Dashboard. On the other head, if reader of this document is a developer or would like to better understand behind-the-scenes of the BCMS, this document is a good place to start.

- [BCMS Backend](https://github.com/becomesco/cms-backend) - or the **backend**, refers to a Core BCMS module which handles common and custom backend tasks. Some of those tasks are: communication with a database, database caching, scoping, restrictions and security, object aggregation and relational updates, realtime connection with sockets and many more.
- [BCMS UI](https://github.com/becomesco/cms-ui) - or the **dashboard**, refers to a Core BCMS module which provides beautiful user interface and handles interactions.
- [BCMS SDK](https://github.com/becomesco/cms-sdk) - or the **sdk**, refers to a Core BCMS module which provides a layer of abstraction between the UI and the backend. Among many things, it handles caching, communication with the backend API and data synchronization. It is extended and used by the dashboard.

## Getting started

Easiest way to get started is using the CLI since it will create a codebase and update it with custom components for specified instance.

> Pre-requirements

- Make sure that you have account on [BCMS Cloud](https://cloud.thebcms.com) and that you have Admin privileges on at least 1 instance.
- Make sure that [Node 14+](https://nodejs.org/en/) is installed on your system.
- Make sure that [Docker](https://www.docker.com/) is installed and running on your system.
- If you do not have it, install [Docker Compose](https://docs.docker.com/compose/) tool.

> Installation

- Install CLI globally: `npm i -g @becomes/cms-cli`
- Open a terminal and navigate to a place where you would like to create the repository.
- Create repository by running: `bcms --cms clone`
- You will be asked to select which instance you would like to clone. This command will create directory with name `<organization_name>-<instance_name>` which you can open in your favorite code editor.
- To start a development server run: `docker-compose up` and the BCMS will be available on http://localhost:8080.
- Done.

## Development and customization

Custom features can be added to the BCMS in 2 ways: [by creating a plugin](#plugins), which is more advanced, and the other is by creating [functions](#functions), [events](#events) and/or [jobs](#jobs). Extending BCMS functionality is limited but powerful. For example, you are not able to modify core BCMS functionality but you can build on top of it.

### Functions

BCMS Functions are JavaScript function which can be executed by sending an HTTP request to the BCMS backend API. Once function is created, it will be available at `POST: /api/function/{FUNCTION_NAME}`. One use-case for the functions might be to create a contact form on a website. This function will send an email using a SMTP client (like [nodemailer](https://nodemailer.com/about/)) and can be called from the website using [BCMS Client](https://github.com/becomesco/cms-client).

> **Example**

Inside of the `src/functions` we will create a new file called `ping-pong.ts`. In of it, we will create a simple handler which will echo a request body and add `pong` property to it.

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

After saving the file, our function will be available at `POST: http://localhost:8080/api/function/ping-pong`. Now using the [Postman](https://www.postman.com/) we can send a HTTP request like shown in Figure 1.

![Figure 1](/assets/readme/fig1.png)

_Figure 1 - Calling a BCMS function._

As you can see, BCMS functions are easy to create and simple to call. It is important to note that the function, which we have created above, is public. This means that anyone can call it without any authorization. Private functions (non-public functions) require authorization by signing a requires using a HTTP Signature. You can see how this works in the [BCMS backend](https://github.com/becomesco/cms-backend) repository or how it is implemented in JavaScript i the [BCMS Client](https://github.com/becomesco/cms-client) repository.

### Events

As mentioned above, there is no direct way to modify a core functionality of the BCMS backend. Because of this, all important features will trigger an internal event called a BCMS Event. It can be an Entry event, Template event, Group event... All that is required to subscribe to an event is to create a file inside of the `src/events` directory.

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

### Jobs

BCMS Jobs are a way to execute a custom code on the BCMS backend at specified interval. Jobs are scheduled using Cron syntax. To create a job, all that is required is to create a file inside of the `src/jobs` directory.

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

In example above, **My job** will be printed in the console every minute.

### Plugins

BCMS Plugins are specifically bundled code which can extend functionality of the BCMS backend and BCMS UI. For more information [visit plugin repository](https://github.com/becomesco/cms-plugin-starter).