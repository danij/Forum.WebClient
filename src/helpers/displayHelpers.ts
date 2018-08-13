export module DisplayHelpers {

    const EnMonths: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    export function intToString(value: number): string {

        let result = '';
        value = (value || 0);

        const sign = Math.sign(value);
        value = Math.abs(value);

        while (value >= 1000) {
            result = ' ' + ('000' + (value % 1000)).slice(-3) + result;
            value = Math.floor(value / 1000);
        }
        result = ' ' + (sign * value) + result;

        return result.trim();
    }

    export function largeMinus(value: string): string {

        return value.replace('-', '−'); //U+2212 : MINUS SIGN
    }

    export function intToStringLargeMinus(value: number): string {

        return largeMinus(intToString(value));
    }

    export function padPositiveWithZeros(value: number, size: number): string {

        return ('0'.repeat(size || 1) + value).substr(-size);
    }

    function getCurrentEpochTime(): number {

        return Math.floor((new Date).getTime() / 1000);
    }

    function dateFromEpochTime(epochTime: number): Date {

        const result = new Date(0);
        result.setUTCSeconds(epochTime);

        return result;
    }

    // export function getFullDateTime(epochTime: number): string {
    //
    //     if (epochTime < 1) return '-';
    //
    //     const date = dateFromEpochTime(epochTime);
    //     return date.toString();
    // }

    function getDateTimeInternal(epochTime: number): {date: string, time: string} {

        if (epochTime < 1) return null;

        const date = dateFromEpochTime(epochTime);

        const dateString = formatDate(date);

        const timeString = [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map(v => padPositiveWithZeros(v, 2))
            .join(':');

        return {date: dateString, time: timeString};
    }

    export function getDateTime(epochTime: number): string {

        const dateTime = getDateTimeInternal(epochTime);
        if (null === dateTime) return '–';

        return `<span class="date-time"><span class="date">${dateTime.date}</span> ${dateTime.time}</span>`;
    }

    export function getDateTimeText(epochTime: number): string {

        const dateTime = getDateTimeInternal(epochTime);
        if (null === dateTime) return '–';

        return `${dateTime.date} ${dateTime.time}`;
    }

    export function getDateTimeLargeSeparator(epochTime: number): string {

        return getDateTimeText(epochTime).replace(' ', '\u2002'); //using en-space for a better visual separation
    }

    export function getShortDate(epochTime: number): string {

        if (epochTime < 1) return '–';

        const date = dateFromEpochTime(epochTime);
        return formatDate(date);
    }

    function formatDate(date: Date) : string {

        return `${padPositiveWithZeros(date.getDate(), 2)}-${EnMonths[date.getMonth()]}-${padPositiveWithZeros(date.getFullYear() % 100, 2)}`;
    }

    // export function getAgoTime(epochTime: number): string {
    //
    //     const difference = getCurrentEpochTime() - (epochTime || 0);
    //
    //     if (difference < 2) {
    //         return '1 second ago';
    //     }
    //     else if (difference < 60) {
    //         return `{difference} seconds ago`;
    //     }
    //     else if (difference < 3600) {
    //
    //         const minutes = Math.floor(difference / 60);
    //         const seconds = difference - minutes * 60;
    //
    //         return `${minutes} ${minutes != 1 ? 'minutes' : 'minute'}, ${seconds} ${seconds != 1 ? 'seconds' : 'second'} ago`;
    //     }
    //     else if (difference < 24 * 3600) {
    //
    //         const hours = Math.floor(difference / 3600);
    //         const minutes = Math.floor((difference - hours * 3600) / 60);
    //
    //         return `${hours} ${hours != 1 ? 'hours' : 'hour'}, ${minutes} ${minutes != 1 ? 'minutes' : 'minute'} ago`;
    //     }
    //
    //     const days = Math.floor(difference / (24 * 3600));
    //     const hours = Math.floor((difference - days * 24 * 3600) / 3600);
    //
    //     return `${intToString(days)} ${days != 1 ? 'days' : 'day'}, ${hours} ${hours != 1 ? 'hours' : 'hour'} ago`;
    // }
    //
    // export function getAgoTimeShort(epochTime: number): string {
    //
    //     const difference = getCurrentEpochTime() - epochTime;
    //
    //     if (difference < 2) {
    //         return '1 second ago';
    //     }
    //     else if (difference < 60) {
    //         return `{difference} seconds ago`;
    //     }
    //     else if (difference < 3600) {
    //
    //         const minutes = Math.floor(difference / 60);
    //
    //         return `${minutes} ${minutes != 1 ? 'minutes' : 'minute'} ago`;
    //     }
    //     else if (difference < 24 * 3600) {
    //
    //         const hours = Math.floor(difference / 3600);
    //
    //         return `${hours} ${hours != 1 ? 'hours' : 'hour'} ago`;
    //     }
    //
    //     const days = Math.floor(difference / (24 * 3600));
    //
    //     return `${intToString(days)} ${days != 1 ? 'days' : 'day'} ago`;
    // }
}
