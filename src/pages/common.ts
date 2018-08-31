import {Views} from '../views/common';
import {TagRepository} from '../services/tagRepository';
import {UserRepository} from '../services/userRepository';
import {CategoryRepository} from '../services/categoryRepository';
import {ThreadRepository} from '../services/threadRepository';
import {DOMHelpers} from '../helpers/domHelpers';

export module Pages {

    export interface Page {

        display(): void;
    }

    export interface ScrollDirection {

        top?: boolean;
        bottom?: boolean;
    }

    export function changePage(handler: () => Promise<HTMLElement>): Promise<void> {

        Views.hideOpenModals();

        return Views.changeContent(document.getElementById('page-content-container'), handler);
    }

    export function changePageDontRefreshMath(handler: () => Promise<HTMLElement>): Promise<void> {

        Views.hideOpenModals();

        return Views.changeContent(document.getElementById('page-content-container'), handler, false);
    }

    declare var UIkit: any;

    export interface PageLink {

        title: string,
        link: string,
        docName: string
    }

    export interface MasterPageConfig {

        baseUri: string
        title: string
        navLinks: PageLink[],
        allowedAuthProviders: string[],
        externalImagesWarningFormat: string
    }

    declare const masterPageConfig: MasterPageConfig;

    while (masterPageConfig.baseUri.endsWith('/')) {

        masterPageConfig.baseUri = masterPageConfig.baseUri.substr(0, masterPageConfig.baseUri.length - 1);
    }

    export function getConfig(): MasterPageConfig {

        return masterPageConfig;
    }

    export function getHomeUrl(): string {

        return masterPageConfig.baseUri;
    }

    export function getUrl(relative: string): string {

        return `${masterPageConfig.baseUri}/${relative}`;
    }

    export function getApiUrl(relative: string): string {

        return `${masterPageConfig.baseUri}/api/${relative}`;
    }

    export function getAllowedAuthProviders(): string[] {

        return masterPageConfig.allowedAuthProviders || [];
    }

    export function isLocalUrl(url: string): boolean {

        return url.startsWith(masterPageConfig.baseUri + '/');
    }

    function showError(message: string): void {

        Views.showDangerNotification('An error has occurred: ' + message);
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

    export async function getOrShowErrorAndDefault<T>(promise: Promise<T>, defaultFn: () => T): Promise<T> {

        try {
            return await promise;
        }
        catch (ex) {

            showError(ex.message);
            return defaultFn();
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
    const docSourceRegex = /\/documentation\/([^/]+)/;

    export function getOrderBy(url: string): string {

        const match = url.match(orderByRegex);
        if (match && match.length) {

            return match[1].trim();
        }
        return null;
    }

    export function getSortOrder(url: string): string {

        const match = url.match(sortOrderRegex);
        if (match && match.length) {

            return match[1].trim();
        }
        return null;
    }

    export function getPageNumber(url: string): number {

        const match = url.match(pageNumberRegex);
        if (match && match.length) {

            return Math.max(parseInt(match[1]) - 1, 0);
        }
        return 0;
    }

    export function getTagName(url: string): string {

        const match = url.match(tagNameRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function getThreadId(url: string): string {

        const match = url.match(threadIdRegex);
        if (match && match.length) {

            return decodeURIComponent(match[2]);
        }
        return null;
    }

    export function getThreadMessageId(url: string): string {

        const match = url.match(threadMessageIdRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function getUserName(url: string): string {

        const match = url.match(userNameRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function getSubscribedByUserName(url: string): string {

        const match = url.match(subscribedByUserNameRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
        }
        return null;
    }

    export function getCategory(url: string): IdNamePair {

        const match = url.match(categoryRootRegex);
        if (match && match.length) {

            return {
                id: decodeURIComponent(match[2]),
                name: decodeURIComponent(match[1])
            };
        }
        return null;
    }

    export function getDocSource(url: string): string {

        const match = url.match(docSourceRegex);
        if (match && match.length) {

            return decodeURIComponent(match[1]);
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

    function encodeURIComponentMax(url: string, maxSize: number): string {

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

    export function getThreadMessageCommentsWrittenByUserUrlFull(user: UserRepository.User): string {

        return getUrl(getThreadMessageCommentsWrittenByUserUrl(user.name));
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

        if (Views.DisplayConfig.useDashesForThreadNameInUrl) {

            name = name.replace(/\s/g, '-');
        }

        return `thread/${encodeURIComponentMax(name, maxNameSizeInUrl)}/${encodeURIComponent(id)}`;
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

    export function getUserLogoSrc(user: UserRepository.User): string {

        return getApiUrl(`users/logo/${user.id}`);
    }

    export function getScrollDirection(newPage: number, oldPage: number): ScrollDirection {

        const result: Pages.ScrollDirection = {};

        if (newPage > oldPage) {

            result.top = true;
        }
        else if (newPage < oldPage) {

            result.bottom = true;
        }
        return result;
    }

    export function scrollPage(scrollDirection: ScrollDirection): void {

        if ( ! scrollDirection.top && ! scrollDirection.bottom) return;

        setTimeout(() => {

            const paginationElements = document.getElementsByClassName('uk-pagination');

            if (scrollDirection.top) {

                document.getElementsByClassName('page-content')[0].children[0].scrollIntoView();
            }
            else if (scrollDirection.bottom && paginationElements.length > 1) {

                paginationElements[1].scrollIntoView();
            }

        }, 500);
    }

    export function setupSortControls(page: any, controls: HTMLElement): void {

        if (( ! page) || ( ! controls)) return;

        const radioElements = controls.querySelectorAll('input[type=radio]');

        DOMHelpers.forEach(radioElements, radioElement => {

            radioElement.addEventListener('change', (ev) => {

                page.orderBy = (ev.target as HTMLInputElement).value;
                page.refreshUrl();
                page.refreshList({

                    top: true
                });
            });
        });

        const selectElements = controls.querySelectorAll("select[name='sortOrder']");

        DOMHelpers.forEach(selectElements, selectElement => {

            selectElement.addEventListener('change', (ev) => {

                page.sortOrder = (ev.target as HTMLSelectElement).value;
                page.refreshUrl();
                page.refreshList({

                    top: true
                });
            });
        });
    }
}