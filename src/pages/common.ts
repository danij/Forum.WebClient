import {Views} from "../views/common";
import {TagRepository} from "../services/tagRepository";
import {UserRepository} from "../services/userRepository";
import {CategoryRepository} from "../services/categoryRepository";
import {ThreadRepository} from "../services/threadRepository";

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

    export interface IdNamePair {

        id: string,
        name: string
    }

    const orderByRegex = /\/orderby\/([^\/]+)/;
    const sortOrderRegex = /\/sortorder\/([^\/]+)/;
    const pageNumberRegex = /\/page\/([0-9]+)/;
    const tagNameRegex = /\/tag\/([^/]+)/;
    const threadIdRegex = /\/thread\/([^/]+)\/([^/]+)/;
    const userNameRegex = /\/user\/([^/]+)/;
    const categoryRootRegex = /^[\/]?category\/([^/]+)\/([^/]+)/;

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

    export function getTagName(url: string): string {

        let match = url.match(tagNameRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function getThreadId(url: string): string {

        let match = url.match(threadIdRegex);
        if (match && match.length) {

            return decodeURIComponent(match[2]);
        }
        return null;
    }

    export function getUserName(url: string): string {

        let match = url.match(userNameRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function getCategory(url: string): IdNamePair {

        let match = url.match(categoryRootRegex);
        if (match && match.length) {

            return {
                id: decodeURIComponent(match[2]),
                name: decodeURIComponent(match[1])
            };
        }
        return null;
    }

    export function appendToUrl(extra: string, details: { orderBy?: string, sortOrder: string, pageNumber?: number }): string {

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

        return getUrl(getThreadsWithTagUrlByName(tag.name));
    }

    export function getThreadsWithTagUrlByName(tagName: string): string {

        return `threads/tag/${encodeURIComponent(tagName)}`;
    }

    export function getThreadsOfUserUrlFull(user: UserRepository.User): string {

        return getUrl(getThreadsOfUserUrl(user.name));
    }

    export function getThreadsOfUserUrl(name: string): string {

        return `threads/user/${encodeURIComponent(name)}`;
    }

    export function getThreadMessagesOfUserUrlFull(user: UserRepository.User): string {

        return getUrl(getThreadMessagesOfUserUrl(user.name));
    }

    export function getThreadMessagesOfUserUrl(name: string): string {

        return `thread_messages/user/${encodeURIComponent(name)}`;
    }

    export function getThreadMessagesOfThreadUrlFull(thread: ThreadRepository.Thread): string {

        return getUrl(getThreadMessagesOfThreadUrl(thread.id, thread.name));
    }

    export function getThreadMessagesOfThreadUrl(id: string, name: string): string {

        return `thread_messages/thread/${encodeURIComponent(name)}/${encodeURIComponent(id)}`;
    }

    export function getCategoryFullUrl(category: CategoryRepository.Category): string {

        return getUrl(getCategoryUrl(category.id, category.name));
    }

    export function getCategoryUrl(id: string, name: string): string {

        return `category/${encodeURIComponent(name)}/${encodeURIComponent(id)}`;
    }
}