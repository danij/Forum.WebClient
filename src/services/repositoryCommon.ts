export module RepositoryCommon {

    export function getCookieValue(name: string): string {

        const nameValuePairs = document.cookie
            .split(';')
            .map(p => p.trim().split('='));

        for (let nameValuePair of nameValuePairs) {

            if (nameValuePair[0] == name) {

                return nameValuePair[1];
            }
        }
    }
}