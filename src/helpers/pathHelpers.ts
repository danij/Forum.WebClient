export module PathHelpers {

    export function trimPathSeparator(value: string): string {

        let start = 0;
        let length = value.length;

        for (let i = 0; (i < value.length) && (value[i] == '/'); ++i) {

            start += 1;
            length -= 1;
        }
        for (let i = value.length - 1; i > 0 && (value[i] == '/'); --i) {

            length -= 1;
        }

        return value.substr(start, length);
    }

    export function joinPath(...elements): string {

        return elements.map(trimPathSeparator).join('/');
    }

    export function queryParameters(input: any, appendPrefix: boolean): string {

        let result = Object.getOwnPropertyNames(input)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(input[key])}`).join('&');

        if (result.length && appendPrefix) {

            result = '?' + result;
        }
        return result;
    }
}