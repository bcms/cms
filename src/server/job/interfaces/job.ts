export interface JobCron {
  minute: number[];
  hour: number[];
  dayM: number[];
  dayW: number[];
  month: number[];
}

export interface Job {
  name: string;
  type: 'interval' | 'cron';
  value: JobCron | number;
  handler: () => Promise<void>;
  timer?: NodeJS.Timeout;
}
