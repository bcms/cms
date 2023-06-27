# Functions

BCMS Functions are JavaScript function which can be executed by sending an HTTP request to the BCMS backend API. Once function is created, it will be available at `POST: /api/function/{FUNCTION_NAME}`. One use-case for the functions might be to create a contact form on a website. This function will send an email using a SMTP client (like [nodemailer](https://nodemailer.com/about/)) and can be called from the website using [BCMS Client](https://github.com/becomesco/cms-client).

> **Example**

Inside of the `src/functions` we will create a new file called `ping-pong.ts`. In of it, we will create a simple handler which will echo a request body and add `pong` property to it.

```ts
import { createBcmsFunction } from '@becomes/cms-backend/src/function';

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