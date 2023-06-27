import { apiErrorTranslation } from '../translations';
import type { Throwable } from '../types';

let throwable: Throwable;

export function useThrowable(): Throwable {
  if (!throwable) {
    throwable = async <ThrowableResult, OnSuccessResult, OnErrorResult>(
      throwableFn: () => Promise<ThrowableResult>,
      onSuccess?: (data: ThrowableResult) => Promise<OnSuccessResult>,
      onError?: (error: unknown) => Promise<OnErrorResult>
    ): Promise<OnSuccessResult | OnErrorResult> => {
      let output: ThrowableResult;
      try {
        output = await throwableFn();
      } catch (e) {
        if (onError) {
          return await onError(e);
        } else {
          // eslint-disable-next-line no-console
          console.error(e);
          const err = e as {
            status: number;
            code: string;
            message: string;
          };
          if (err.code && err.message) {
            const message = apiErrorTranslation(err.code, err.message);

            if (message) {
              window.bcms.notification.error(message);
              return e as OnErrorResult;
            }
          }
          if (
            (e as Error).message &&
            (e as Error).message.indexOf('->') !== -1
          ) {
            window.bcms.notification.error((e as Error).message.split('->')[1]);
          } else {
            window.bcms.notification.error((e as Error).message);
          }
          return e as OnErrorResult;
        }
      }
      if (onSuccess) {
        return await onSuccess(output);
      }
      return undefined as never;
    };
  }
  return throwable;
}
