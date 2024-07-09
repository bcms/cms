export class WorkerError {
  constructor(public error: unknown, public workerId: string) {}
}
