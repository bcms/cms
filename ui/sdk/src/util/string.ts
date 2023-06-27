import type { BCMSStringUtility } from '../types';

export function createBcmsStringUtility(): BCMSStringUtility {
  return {
    toPretty(s) {
      let c = s;
      let splitBy = '-';
      if (s.indexOf('_') !== -1) {
        splitBy = '_';
      }
      if (s.startsWith('#')) {
        c = s.substring(1);
      }
      return c
        .split(splitBy)
        .map((part) => {
          return (
            part.substring(0, 1).toUpperCase() +
            part.substring(1, part.length).toLowerCase()
          );
        })
        .join(' ');
    },
    toSlug(s) {
      return s
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/_/g, '-')
        .replace(/[^0-9a-z---]+/g, '');
    },
    toSlugUnderscore(s) {
      return s
        .toLowerCase()
        .replace(/ /g, '_')
        .replace(/-/g, '_')
        .replace(/[^0-9a-z_-_]+/g, '');
    },
    toEnum(s) {
      return s
        .toUpperCase()
        .replace(/ /g, '_')
        .replace(/-/g, '_')
        .replace(/[^0-9A-Z_-_]+/g, '');
    },
    toShort(s, length) {
      if (s.length > length) {
        const lengthDelta = s.length - length;
        const firstPart = s.substring(0, s.length / 2 - lengthDelta / 2);
        const lastPart = s.substring(s.length / 2 + lengthDelta / 2);
        return firstPart + ' ... ' + lastPart;
      }
      return s;
    },
    textBetween(src, begin, end) {
      const startIndex = src.indexOf(begin);
      if (startIndex === -1) {
        return '';
      }
      const endIndex = src.indexOf(end, startIndex + begin.length);

      if (endIndex === -1) {
        return '';
      }
      return src.substring(startIndex + begin.length, endIndex);
    },
    allTextBetween(src, begin, end) {
      const output: string[] = [];
      const index = {
        begin: src.indexOf(begin, 0),
        end: 0,
      };

      if (index.begin === -1) {
        return [];
      }
      index.end = src.indexOf(end, index.begin);
      if (index.end === -1) {
        return [];
      }
      output.push(src.substring(index.begin + begin.length, index.end));
      // eslint-disable-next-line no-constant-condition
      while (true) {
        index.begin = src.indexOf(begin, index.end);
        if (index.begin === -1) {
          break;
        }
        index.end = src.indexOf(end, index.begin);
        if (index.end === -1) {
          break;
        }
        output.push(src.substring(index.begin + begin.length, index.end));
      }
      return output;
    },
    addZerosAtBeginning(num, count) {
      return `${num}`.padStart(count ? count : 2, '0');
    },
  };
}
