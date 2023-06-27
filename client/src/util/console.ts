import type { BCMSClientConfig, BCMSClientConsole } from '../types';

export function createBcmsClientConsole(
  title: string,
  config: BCMSClientConfig,
): BCMSClientConsole {
  return {
    info(place, message) {
      if (config.debug) {
        // eslint-disable-next-line no-console
        console.log(
          '[INFO]',
          `[${new Date().toLocaleString()}]`,
          title,
          '-',
          place,
          '>',
          message,
        );
      }
    },
    warn(place, message) {
      if (config.debug) {
        // eslint-disable-next-line no-console
        console.warn(
          '[INFO]',
          `[${new Date().toLocaleString()}]`,
          title,
          '-',
          place,
          '>',
          message,
        );
      }
    },
    error(place, message) {
      if (config.debug) {
        // eslint-disable-next-line no-console
        console.error(
          '[INFO]',
          `[${new Date().toLocaleString()}]`,
          title,
          '-',
          place,
          '>',
          message,
        );
      }
    },
  };
}
