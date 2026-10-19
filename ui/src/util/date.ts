import spacetime from 'spacetime';
import { i18n } from '@bcms/selfhosted-ui/i18n';

export function millisToDateString(millis: number, includeTime?: boolean) {
    const locale = i18n.global.locale.value as string;
    const options: Intl.DateTimeFormatOptions = includeTime
        ? {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
          }
        : {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          };
    return new Intl.DateTimeFormat(locale, options).format(new Date(millis));
}

export function dateComponentsToMillis(
    year: number,
    month?: number,
    day?: number,
) {
    const sp = spacetime([year, month || 0, day || 1]);
    return sp.epoch;
}
