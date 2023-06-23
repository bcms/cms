import type { BCMSColorUtility } from '../types';

export function createBcmsColorUtility(): BCMSColorUtility {
  return {
    check(color: string) {
      const checkHex = /^[0-9A-Fa-f]{6}?$/g;
      return color.match(checkHex) ? true : false;
    },
    checkWithAlpha(color: string) {
      const checkHex = /^[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/g;
      return color.match(checkHex) ? true : false;
    },
    colors: [
      {
        main: 'rgb(36, 150, 129)',
        class: { bg: 'bg-green', text: 'text-green' },
      },
      {
        main: 'rgb(236, 173, 169)',
        class: { bg: 'bg-pink', text: 'text-pink' },
      },
      {
        main: 'rgb(255, 205, 25)',
        class: { bg: 'bg-yellow', text: 'text-yellow' },
      },
      { main: 'rgb(245, 107, 88)', class: { bg: 'bg-red', text: 'text-red' } },
    ],
  };
}
