import type { BCMSObjectUtility } from '../types';

let util: BCMSObjectUtility;

export function useBcmsObjectUtility(): BCMSObjectUtility {
  return util;
}

export function createBcmsObjectUtility(): void {
  util = {
    instance(o) {
      return JSON.parse(JSON.stringify(o));
    },
  };
}
