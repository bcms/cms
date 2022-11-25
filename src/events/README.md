# Events

As mentioned above, there is no direct way to modify a core functionality of the BCMS backend. Because of this, all important features will trigger an internal event called a BCMS Event. It can be an Entry event, Template event, Group event... All that is required to subscribe to an event is to create a file inside of the `src/events` directory.

> **Example**

```ts
import { createBcmsEvent } from '@becomes/cms-backend/src/event';
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