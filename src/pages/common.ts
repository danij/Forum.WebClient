import {Views} from "../views/common";

export module Pages {

    export interface Page {

        display(): void;
    }

    export function changePage(handler: () => Promise<HTMLElement>) {

        return Views.changeContent(document.getElementById('pageContentContainer'), handler);
    }

    declare var UIkit: any;

    export async function getOrShowError<T>(promise: Promise<T>): Promise<T> {

        try {
            return await promise;
        }
        catch (e) {

            UIkit.notification({
                message: 'An error has occurred: ' + e.message,
                status: 'primary',
                timeout: 3000
            });
            return null;
        }
    }

    const orderByRegex = /\/orderby\/([^\/]+)/;
    const sortOrderRegex = /\/sortorder\/([^\/]+)/;
    const pageNumberRegex = /\/page\/([0-9]+)/;

    export function getOrderBy(url: string): string {

        let match = url.match(orderByRegex);
        if (match && match.length) {

            return match[1].trim();
        }
        return null;
    }

    export function getSortOrder(url: string): string {

        let match = url.match(sortOrderRegex);
        if (match && match.length) {

            return match[1].trim();
        }
        return null;
    }

    export function getPageNumber(url: string): number {

        let match = url.match(pageNumberRegex);
        if (match && match.length) {

            return Math.max(parseInt(match[1]) - 1, 0);
        }
        return 0;
    }

    export function createUrl(details: {orderBy: string, sortOrder: string, pageNumber?: number}): string {

        let result = '';

        if (details.orderBy && details.orderBy.length) {

            result = result + '/orderby/' + details.orderBy
        }
        if (details.sortOrder && details.sortOrder.length) {

            result = result + '/sortorder/' + details.sortOrder
        }
        if (null != details.pageNumber) {

            result = result + '/page/' + (details.pageNumber + 1);
        }

        return result;
    }
}