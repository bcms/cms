# BCMS

BCMS is a CMS (Content Management System) created and developed by a company [Becomes](https://becomes.co). BCMS is a headless CMS and provides a grate API, best in class model builder and intuitive content editor. It was created because of project needs in our company and we decided to make it Open-Source since it solved a lot of problems that we had with other CMS solutions. We hope that you will find it useful in your next project.

## Table of contents

- [Getting started](#getting-started)
- [Terminology](#terminology)
- [Configuration](#configuration)
- [Development and customization](development-and-customization)
  - [Functions](#functions)
  - [Events](#events)
  - [Jobs](#jobs)
  - [Plugins](#plugins)

## Terminology

BCMS is a very complex system and it can be overwhelming to understand it in detail. Because of that, it is created in such a way that this is not required to successfully use and develop custom functionality for it. Depending on type of a thing that one needs to achieve, deeper understanding of the BCMS system might be required.

If reader of this document is not a developer, it should go to [user manual page]() (not yet available) because this document will not help with using BCMS Dashboard. On the other head, if reader of this document is a developer or would like to better understand behind-the-scenes of the BCMS, this document is a good place to start.

- [BCMS Backend](https://github.com/becomesco/cms-backend) - or the **backend**, refers to a Core BCMS module which handles common and custom backend tasks. Some of those tasks are: communication with a database, database caching, scoping, restrictions and security, object aggregation and relational updates, realtime connections with sockets and many more.
- [BCMS UI](https://github.com/becomesco/cms-ui) - or the **dashboard**, refers to a Core BCMS module which provides beautiful user interface and handles interactions.
- [BCMS SDK](https://github.com/becomesco/cms-sdk) - or the **sdk**, refers to a Core BCMS module which provides a layer of abstraction between the UI and the backend. Among many things, it handles caching, communication with the backend API and data synchronization. If is extended and used by the dashboard.

## Getting started

BCMS can be as complex or as simple as required. This repository is the BCMS Core which is composed of 3 core packages: [backend](https://github.com/becomesco/cms-backend/), [UI](https://github.com/becomesco/cms-ui/) and [bundler](https://github.com/becomesco/cms-bundler/). Running BCMS locally is as simple as running few command in the terminal.

- Clone the repository by running `git clone git@github.com:becomesco/cms bcms`,
- Enter the directory by running `cd bcms` and install dependencies by running `npm i`,
- And finally start the BCMS in development node by running `npm run dev`. First, backend will be started and few seconds later UI will be started.
- Open the browser and navigate to `http://localhost:1280`

## Configuration

BCMS backend expects `bcms.config.js` file to exist at the root of the project. It provides some basic information about the project itself and it is not complex to understand.

- `backend` - an object for BCMS backend configuration.
  - `port` - at with port should application be available
  - `security` - an object for specifying security information. Currently, only JWT security mechanism is available and is extended from the [Purple Cheetah JWT Security](https://github.com/becomesco/purple-cheetah/tree/dev/src/security/jwt)
    - `jwt` - an object which provides an information about JWT tokens. It is important to know that BCMS backend uses only HMAC-SHA256 for generating JWT signature, therefore `secret` in the `jwt` object should be 256-bit string.
  - `database` - the backend currently supports 2 databases extended from the [Purple Cheetah Database](https://github.com/becomesco/purple-cheetah#database). One is a FSDB (filesystem database) and other is a MongoDB database. FSDB is meant for a development and many staging purposes because, with it, it is easy to share database data between users and machines. MongoDB is more meant for the production environment but it can also be used for staging and development.
    - `fs` - indicate to the backend that it should use FSDB. String parsed to this property will be used as a collection prefix.
    - `mongodb` - indicate to the backend that it should use MongoDB. This property is an object with 2 options:
      - `atlas` - indicate to the backend that it should use [MongoDB Atlas](https://www.mongodb.com/),
      - `selfHosted` - indicate to the backend that it should use self-hosted MongoDB database.
- `plugins` - an array of object with a BCMS Plugin configuration. Plugins can be local or from NPM package. To find out more information go to [this section](#plugins).

## Development and customization

Custom features can be added to the BCMS in 2 ways: [by creating a plugin](#plugins) which is more advanced and requires good programing skills, and the other is by creating [functions](#functions), [events](#events) and/or [jobs](#jobs)

### Functions

BCMS Functions are JavaScript function which can be called by sending an HTTP request. Once function is created it will be available at `POST: /api/function/{FUNCTION_NAME}`. One use-case for the function might be a contact form on the website. Function which will send an email using a SMTP server can be created and called from the website using (BCMS Client)[https://github.com/becomesco/cms-client].

> **Example**

Inside of the `src/functions` new file will be created `hello.ts`. In it, simple handler will be created like shown in the snippet bellow.

```ts
import {BCMSFunctionBuilder} from '@becomes/cms-backend';

module.exports = BCMSFunctionBuilder({
  config: {
    name: 'hello',
    public: true,
  },
  handler: async (request) => {
    const name = request.body.name;
    return `Hello ${name}`;
  }
})
```

After saving the file, compile a TypeScript code by running `npm run src:build`, and after that backend development server can be started by running `npm run dev:backend`. From the [Postman](https://www.postman.com/) HTTP request will be sent like shown in Figure 1.

![Figure 1](/assets/readme/fig1.png)

*Figure 1 - Calling a BCMS function.*

### Events

There might be need to do something when Template is created, maybe sending a Slack notification, or something like that. To do this, one can use BCMS Event. They are simple JavaScript function which are called every time specified event occurs. 
