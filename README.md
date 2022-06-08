# BCMS

BCMS is a CMS (Content Management System) created and developed by a company [Becomes](https://becomes.co). It is a headless CMS which provides a great API, best in class model builder and intuitive content editor. It was created because of project needs in our company and we decided to make it Open-Source (BCMS Cloud provides a free plan) since it solved a lot of problems that we had with other CMS solutions. We hope that you will find it useful in your next project.

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

The BCMS is Open-Source but it is not free (every account on the BCMS Cloud gets 1 free license). The BCMS Cloud is a platform which provides a way to monetize the BCMS instances. It is used for issuing BCMS Licenses, managing BCMS Instances and providing tools for organizations to easily add people and manager roles.

![Cloud connection](/assets/readme/fig2.png)

_Figure 1 - Connection between the BCMS Cloud and BCMS Instance._

As it can be seen in Figure 1, the BCMS Instance runs outside of the BCMS Cloud. This means that owner of the Instance is also the owner of all the data. The BCMS Cloud only stores necessary data about users and essential data about the Instance, while all other data is stored in your database and the BCMS Cloud does not have access to it.

In the Figure 1 you can also see that there are 2 arrows connection the BCMS Cloud and the Instance, 1 is pointing from the Shim to the BCMS Cloud API gateway, while other is pointing from the BCMS Cloud API gateway to Nginx proxy on the Instance's server. Those 2 connections are providing a way for the Shim to send data to the BCMS Cloud and the BCMS Cloud to send data to the Shim. This connections are enabled by the BCMS License.

### BCMS License

BCMS License is created by the BCMS Cloud when an Instance is created. License has 2 roles:

- Proving the ownership over an Instance,
- Enabling secure communication between the Shim and the BCMS Cloud.

Every request to and from the Shim is first signed (using HMAC-SHA256) and then encrypted (using AES-256-GCM) using the License file. This provides secure data transfer over the HTTP and even safer over HTTPS. If you would like to see how this is implemented, please refer to [this file in the Shim repository](https://github.com/becomesco/cms-shim/blob/next/src/services/security.ts).

## Terminology

BCMS is a very complex system and it can be overwhelming to understand it in detail. Because of that, it is created in such a way that details are not required to successfully use and develop custom functionality for it. Depending on type of a thing that one needs to achieve, deeper understanding of the BCMS system might be required.

If reader of this document is not a developer, it should go to [user manual page]() (not yet available) because this document will not help with using BCMS Dashboard. On the other head, if reader of this document is a developer or would like to better understand behind-the-scenes of the BCMS, this document is a good place to start.

- [BCMS Backend](https://github.com/becomesco/cms-backend) - or the **backend**, refers to a Core BCMS module which handles common and custom backend tasks. Some of those tasks are: communication with a database, database caching, scoping, restrictions and security, object aggregation and relational updates, realtime connection with sockets and many more.
- [BCMS UI](https://github.com/becomesco/cms-ui) - or the **dashboard**, refers to a Core BCMS module which provides beautiful user interface and handles interactions.
- [BCMS SDK](https://github.com/becomesco/cms-sdk) - or the **sdk**, refers to a Core BCMS module which provides a layer of abstraction between the UI and the backend. Among many things, it handles caching, communication with the backend API and data synchronization. It is extended and used by the dashboard.

## Getting started

> Pre-requirements

- Make sure that [Node 14+](https://nodejs.org/en/) is installed on your system.
- Make sure that [Docker](https://www.docker.com/) is installed and running on your system.
- If you do not have it, install [Docker Compose](https://docs.docker.com/compose/) tool.

> Installation

- Install BCMS CLI: `npm i -g @becomes/cms-cli`
- Open a terminal and navigate to a place where you would like to create a project.
- Create a project by running: `bcms --cms create`.
- CD into the project and run `docker-compose up`.
- BCMS will be available on post 8080: http://localhost:8080
- Done.

## Development and customization

Custom features can be added to the BCMS in 2 ways: [by creating a plugin](#plugins), which is more advanced, or by creating [functions](#functions), [events](#events) and/or [jobs](#jobs). Extending BCMS functionality is limited but powerful. For example, you are not able to modify core BCMS functionality but you can build on top of it.

### Functions

BCMS Functions are JavaScript function which can be executed by sending an HTTP request to the BCMS backend API. Once function is created, it will be available at `POST: /api/function/{FUNCTION_NAME}`. One use-case for functions might be to create a contact form on a website. This function will send an email using a SMTP client (like [nodemailer](https://nodemailer.com/about/)) and can be called from the website using [BCMS Client](https://github.com/becomesco/cms-client).

> **Example**

Inside of the `src/functions` we will create a new file called `ping-pong.ts`. Inside of it, we will create a simple handler which will echo a request body and add `pong` property to it.

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

After saving the file, our function will be available at `POST: http://localhost:8080/api/function/ping-pong`. Now, using the [Postman](https://www.postman.com/) we can send an HTTP request like shown in Figure 2.

![Figure 2](/assets/readme/fig1.png)

_Figure 2 - Calling a BCMS function._

As you can see, BCMS functions are easy to create and simple to call. It is important to note that the function, which we have created above, is public. This means that anyone can call it without any authorization. Private functions (non-public functions) require authorization by signing a requires using an HTTP Signature. You can see how this works in the [BCMS Backend repository](https://github.com/becomesco/cms-backend/blob/master/src/security/api.ts) or how it is implemented in JavaScript in the [BCMS Client repository](https://github.com/becomesco/cms-client/blob/master/src/util/security.ts).

### Events

As mentioned above, there is no direct way to modify a core functionality of the BCMS Backend. Because of this, all important features will trigger an internal event called a BCMS Event. It can be an Entry event, Template event, Group event ([full list of events](https://github.com/becomesco/cms-backend/blob/master/src/types/event/config.ts))... All that is required to subscribe to an event is to create a file inside of the `src/events` directory.

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

It is important to know that you can emit custom event using [BCMS Event Manager](https://github.com/becomesco/cms-backend/blob/master/src/types/event/manager.ts).

### Jobs

BCMS Jobs are a way to execute a custom code on the BCMS Backend at specified interval. Jobs are scheduled using Cron syntax. To create a job, all that is required is to create a file inside of the `src/jobs` directory.

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
