export class WorkerResult<Output> {
  constructor(public result: Output, public workerId: string) {}
}
