import spacetime from 'spacetime';
import { base10Padding } from '@bcms/selfhosted-ui/util/string';

export const MonthNumToStr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Avg',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
export function millisToDateString(millis: number, includeTime?: boolean) {
    const date = new Date(millis);
    return `${MonthNumToStr[date.getMonth()]} ${date.getDate()}/${
        date.getMonth() + 1
    }/${date.getFullYear()}${
        includeTime
            ? ` ${base10Padding(date.getHours())}:${base10Padding(
                  date.getMinutes(),
              )}`
            : ''
    }`;
}

export function dateComponentsToMillis(
    year: number,
    month?: number,
    day?: number,
) {
    const sp = spacetime([year, month || 0, day || 1]);
    return sp.epoch;
}
