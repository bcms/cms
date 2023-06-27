import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSJobCron {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}
export const BCMSJobCronSchema: ObjectSchema = {
  minute: {
    __type: 'string',
    __required: true,
  },
  hour: {
    __type: 'string',
    __required: true,
  },
  dayOfMonth: {
    __type: 'string',
    __required: true,
  },
  month: {
    __type: 'string',
    __required: true,
  },
  dayOfWeek: {
    __type: 'string',
    __required: true,
  },
};

export interface BCMSJobHandler {
  (): Promise<void>;
}

export interface BCMSJob {
  cron: BCMSJobCron;
  handler: BCMSJobHandler;
}
export const BCMSJobSchema: ObjectSchema = {
  cron: {
    __type: 'object',
    __required: true,
    __child: BCMSJobCronSchema,
  },
  handler: {
    __type: 'function',
    __required: true,
  },
};
