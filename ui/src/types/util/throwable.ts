export interface Throwable {
  <ThrowableResult, OnSuccessResult, OnErrorResult>(
    throwableFn: () => Promise<ThrowableResult>,
    onSuccess?: (data: ThrowableResult) => Promise<OnSuccessResult>,
    onError?: (error: unknown) => Promise<OnErrorResult>
  ): Promise<OnSuccessResult | OnErrorResult>;
}
