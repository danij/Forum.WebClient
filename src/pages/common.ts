import {Views} from "../views/common";
import {TagRepository} from "../services/tagRepository";

export module Pages {

    export interface Page {

        display(): void;
    }

    export function changePage(handler: () => Promise<HTMLElement>) {

        return Views.changeContent(document.getElementById('pageContentContainer'), handler);
    }

    declare var UIkit: any;

    export interface MasterPageConfig {

        baseUri: string
    }

    declare const masterPageConfig: MasterPageConfig;

    export function getUrl(relative: string): string {

        return `${masterPageConfig.baseUri}/${relative}`;
    }

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
    const tagIdOrNameRegex = /\/tag\/([^/]+)/;

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

    export function getTagIdOrName(url: string): string {

        let match = url.match(tagIdOrNameRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function appendToUrl(extra: string, details: {orderBy: string, sortOrder: string, pageNumber?: number}): string {

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

        return extra + result;
    }

    export function getThreadsWithTagUrlFull(tag: TagRepository.Tag): string {

        return getUrl(getThreadsWithTagUrlByIdOrName(tag.name));
    }

    export function getThreadsWithTagUrlByIdOrName(tagIdOrName: string) : string {

        return `threads/tag/${encodeURIComponent(tagIdOrName)}`;
    }

}