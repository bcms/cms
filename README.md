# BCMS

BCMS is a CMS (Content Management System) created and developed by a company [Becomes](https://becomes.co). BCMS is a headless CMS and provides a grate API, best in class model builder and intuitive content editor. It was created because of project needs in our company and we decided to make it Open-Source since it solved a lot of problems that we had with other CMS solutions. We hope that you will find it useful in your next project.

## Getting started

BCMS can be as complex or as simple as required. This repository is the BCMS Core which is composed of 3 core packages: [backend](https://github.com/becomesco/cms-backend/), [UI](https://github.com/becomesco/cms-ui/) and [bundler](https://github.com/becomesco/cms-bundler/). Running BCMS locally is as simple as running few command in the terminal.

- Clone the repository by running `git clone git@github.com:becomesco/cms bcms`,
- Enter the directory by running `cd bcms` and install dependencies by running `npm i`,
- And finally start the BCMS in development node by running `npm run dev`. First, backend will be started and few seconds later UI will be started.
- Open the browser and navigate to `http://localhost:1280`

## Customization

Custom features can be added to the BCMS in 2 ways: [by creating a plugin](https://github.com/becomesco/cms-plugin-starter) which is more advanced and required good programing skills, and the other is by creating [functions](#functions), [events](#events) and/or [jobs](#jobs)

### Functions

BCMS Functions are JavaScript function which can be called by sending a HTTP request. Once function is created it will be available at `POST: /api/function/{FUNCTION_NAME}`.

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
