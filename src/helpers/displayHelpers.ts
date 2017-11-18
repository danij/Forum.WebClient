export module DisplayHelpers {

    const EnMonths: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    export function intToString(value: number): string {

        let result = '';
        value = (value || 0);

        while (value >= 1000) {
            result = ' ' + (value % 1000) + result;
            value = Math.floor(value / 1000);
        }
        result = ' ' + value + result;

        return result.trim();
    }

    export function padPositiveWithZeros(value: number, size: number): string {

        return ('0'.repeat(size || 1) + value).substr(-size);
    }

    function getCurrentEpochTime(): number {

        return Math.floor((new Date).getTime() / 1000);
    }

    function dateFromEpochTime(epochTime: number): Date {

        let result = new Date(0);
        result.setUTCSeconds(epochTime);

        return result;
    }

    export function getFullDateTime(epochTime: number): string {

        if (epochTime < 1) return '-';

        const date = dateFromEpochTime(epochTime);
        return date.toString();
    }

    export function getShortDate(epochTime: number): string {

        if (epochTime < 1) return '-';

        const date = dateFromEpochTime(epochTime);
        return `${date.getDate()}-${EnMonths[date.getMonth()]}-${padPositiveWithZeros(date.getFullYear() % 100, 2)}`;
    }

    export function getAgoTime(epochTime: number): string {

        const difference = getCurrentEpochTime() - (epochTime || 0);

        if (difference < 2) {
            return '1 second ago';
        }
        else if (difference < 60) {
            return `{difference} seconds ago`;
        }
        else if (difference < 3600) {

            const minutes = Math.floor(difference / 60);
            const seconds = difference - minutes * 60;

            return `${minutes} ${minutes != 1 ? 'minutes' : 'minute'}, ${seconds} ${seconds != 1 ? 'seconds' : 'second'} ago`;
        }
        else if (difference < 24 * 3600) {

            const hours = Math.floor(difference / 3600);
            const minutes = Math.floor((difference - hours * 3600) / 60);

            return `${hours} ${hours != 1 ? 'hours' : 'hour'}, ${minutes} ${minutes != 1 ? 'minutes' : 'minute'} ago`;
        }

        const days = Math.floor(difference / (24 * 3600));
        const hours = Math.floor((difference - days * 24 * 3600) / 3600);

        return `${intToString(days)} ${days != 1 ? 'days' : 'day'}, ${hours} ${hours != 1 ? 'hours' : 'hour'} ago`;
    }

    export function getAgoTimeShort(epochTime: number): string {

        const difference = getCurrentEpochTime() - epochTime;

        if (difference < 2) {
            return '1 second ago';
        }
        else if (difference < 60) {
            return `{difference} seconds ago`;
        }
        else if (difference < 3600) {

            const minutes = Math.floor(difference / 60);

            return `${minutes} ${minutes != 1 ? 'minutes' : 'minute'} ago`;
        }
        else if (difference < 24 * 3600) {

            const hours = Math.floor(difference / 3600);

            return `${hours} ${hours != 1 ? 'hours' : 'hour'} ago`;
        }

        const days = Math.floor(difference / (24 * 3600));

        return `${intToString(days)} ${days != 1 ? 'days' : 'day'} ago`;
    }
}
