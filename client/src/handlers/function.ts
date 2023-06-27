import type { AxiosError } from 'axios';
import type {
  SendFunction,
  GetKeyAccess,
  BCMSClientFunctionHandler,
} from '../types';

export function createBcmsClientFunctionHandler({
  send,
  getKeyAccess,
}: {
  send: SendFunction;
  getKeyAccess: GetKeyAccess;
}): BCMSClientFunctionHandler {
  return {
    async call(fnName, payload) {
      const accessList = await getKeyAccess();
      if (!accessList.functions.find((e) => e.name === fnName)) {
        return {
          success: false,
          result: {
            message: [
              `You do not have permission to call "${fnName}" function.`,
              'Allowed functions:',
              accessList.functions.length === 0
                ? 'NONE'
                : accessList.functions.map((e) => e.name).join(', '),
            ].join(' '),
          },
        };
      }
      const result = await send<
        {
          success: boolean;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result: any;
        },
        AxiosError
      >({
        url: `/function/${fnName}`,
        method: 'POST',
        data: payload,
        async onError(error) {
          return error;
        },
      });
      if (!result.result) {
        throw result;
      }
      return result;
    },
  };
}
