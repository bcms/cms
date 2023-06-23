import type { BCMSDateUtility, BCMSDateUtilityConfig } from '../types';

export function createBcmsDateUtility({
  stringUtil,
}: BCMSDateUtilityConfig): BCMSDateUtility {
  const self: BCMSDateUtility = {
    prettyElapsedTimeSince(millis) {
      const timeDiff = Math.abs(Date.now() - millis);
      const days = parseInt(`${(timeDiff / 86400000).toFixed(1)}`);
      if (days > 10) {
        return self.toReadable(millis);
      }
      const hours = parseInt(`${timeDiff / 3600000}`);
      const minutes = parseInt(`${timeDiff / 60000}`);
      if (days > 0) {
        return `${days} ${days > 1 ? 'days' : 'day'} ago`;
      } else if (hours > 0) {
        return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
      } else if (minutes > 0) {
        return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
      } else {
        return `just now`;
      }
    },
    toReadable(millis) {
      const months: string[] = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const date = new Date(millis);
      const minutes = date.getMinutes();
      const hours = date.getHours();
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();

      return `${day} ${months[month]}, ${year} ${stringUtil.addZerosAtBeginning(
        hours,
      )}:${stringUtil.addZerosAtBeginning(minutes)}`;
    },
  };
  return self;
}
