# Jobs

BCMS Jobs are a way to execute a custom code on the BCMS backend at specified interval. Jobs are scheduled using Cron syntax. To create a job, all that is required is to create a file inside of the `src/jobs` directory.

> **Example**

```ts
import { createBcmsJob } from '@becomes/cms-backend/src/job';

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