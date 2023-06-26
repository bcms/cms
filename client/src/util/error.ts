export async function errorWrapper<
  ExecResult = undefined,
  OnSuccessResult = undefined,
  OnErrorResult = undefined,
>({
  exec,
  onSuccess,
  onError,
}: {
  exec(): Promise<ExecResult>;
  onSuccess?(execResult: ExecResult): Promise<OnSuccessResult>;
  onError?(error: unknown): Promise<OnErrorResult>;
}): Promise<OnSuccessResult | OnErrorResult | undefined> {
  try {
    const execResult = await exec();
    if (onSuccess) {
      return await onSuccess(execResult);
    }
    return undefined;
  } catch (error) {
    if (onError) {
      return await onError(error);
    }
    console.error(error);
    throw error;
  }
}
