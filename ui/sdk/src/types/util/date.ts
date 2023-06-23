import type { BCMSStringUtility } from './string';

export interface BCMSDateUtilityConfig {
  stringUtil: BCMSStringUtility;
}

export interface BCMSDateUtility {
  prettyElapsedTimeSince(millis: number): string;
  toReadable(millis: number): string;
}
