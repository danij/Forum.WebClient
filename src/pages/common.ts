import {Views} from "../views/common";
import {TagRepository} from "../services/tagRepository";
import {UserRepository} from "../services/userRepository";
import {CategoryRepository} from "../services/categoryRepository";
import {ThreadRepository} from "../services/threadRepository";

export module Pages {

    export interface Page {

        display(): void;
    }

    export function changePage(handler: () => Promise<HTMLElement>): Promise<void> {

        Views.hideOpenModals();

        return Views.changeContent(document.getElementById('pageContentContainer'), handler).then(() => {

            Views.scrollToTop();
        });
    }

    declare var UIkit: any;

    export interface MasterPageConfig {

        baseUri: string
    }

    declare const masterPageConfig: MasterPageConfig;

    while (masterPageConfig.baseUri.endsWith('/')) {

        masterPageConfig.baseUri = masterPageConfig.baseUri.substr(0, masterPageConfig.baseUri.length - 1);
    }

    export function getHomeUrl(): string {

        return masterPageConfig.baseUri;
    }

    export function getUrl(relative: string): string {

        return `${masterPageConfig.baseUri}/${relative}`;
    }

    function showError(message: string): void {

        Views.showPrimaryNotification('An error has occurred: ' + message);
    }

    export async function getOrShowError<T>(promise: Promise<T>): Promise<T> {

        try {
            return await promise;
        }
        catch (ex) {

            showError(ex.message);
            throw ex;
        }
    }

    export async function trueOrShowErrorAndFalse<T>(promise: Promise<T>): Promise<boolean> {

        try {
            await promise;
            return true;
        }
        catch (ex) {

            showError(ex.message);
            return false;
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
    const threadMessageIdRegex = /\/message\/([^/]+)/;
    const userNameRegex = /\/user\/([^/]+)/;
    const subscribedByUserNameRegex = /\/subscribed_by_user\/([^/]+)/;
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

    export function getThreadMessageId(url: string): string {

        let match = url.match(threadMessageIdRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
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

    export function getSubscribedByUserName(url: string): string {

        let match = url.match(subscribedByUserNameRegex);
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

    function encodeURIComponentMax(url: string, maxSize: number) : string {

        const ellipsis = '...';
        maxSize = Math.max(ellipsis.length, maxSize);
        if (url.length > maxSize) {
            url = url.substr(0, maxSize - ellipsis.length) + ellipsis;
        }
        return encodeURIComponent(url);
    }

    const maxNameSizeInUrl: number = 128;

    export function getThreadsWithTagUrlFull(tag: TagRepository.Tag): string {

        return getUrl(getThreadsWithTagUrlByName(tag.name));
    }

    export function getThreadsWithTagUrlByName(tagName: string): string {

        return `threads/tag/${encodeURIComponent(tagName)}`;
    }

    export function getThreadsOfUserUrlFull(user: UserRepository.User): string {

        return getUrl(getThreadsOfUserUrl(user.name));
    }

    export function getSubscribedThreadsOfUserUrlFull(user: UserRepository.User): string {

        return getUrl(getSubscribedThreadsOfUserUrl(user.name));
    }

    export function getThreadsOfUserUrl(name: string): string {

        return `threads/user/${encodeURIComponent(name)}`;
    }

    export function getSubscribedThreadsOfUserUrl(name: string): string {

        return `threads/subscribed_by_user/${encodeURIComponent(name)}`;
    }

    export function getThreadMessageCommentsWrittenByUserUrl(name: string): string {

        return `thread_message_comments/user/${encodeURIComponent(name)}`;
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

        return `thread_messages/thread/${encodeURIComponentMax(name, maxNameSizeInUrl)}/${encodeURIComponent(id)}`;
    }

    export function getThreadMessagesOfMessageParentThreadUrlFull(messageId: string): string {

        return getUrl(getThreadMessagesOfMessageParentThreadUrl(messageId));
    }

    export function getThreadMessagesOfMessageParentThreadUrl(id: string): string {

        return `thread_messages/message/${encodeURIComponent(id)}`;
    }

    export function getCategoryFullUrl(category: CategoryRepository.Category): string {

        return getUrl(getCategoryUrl(category.id, category.name));
    }

    export function getCategoryUrl(id: string, name: string): string {

        return `category/${encodeURIComponentMax(name, maxNameSizeInUrl)}/${encodeURIComponent(id)}`;
    }
}