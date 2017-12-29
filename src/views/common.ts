import {CommonEntities} from "../services/commonEntities";
import {DOMHelpers} from "../helpers/domHelpers";
import {ThreadsPage} from "../pages/threadsPage";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {HomePage} from "../pages/homePage";
import {ThreadMessagesPage} from "../pages/threadMessagesPage";
import {ViewsExtra} from "./extra";
import {Pages} from "../pages/common";

export module Views {

    import DOMAppender = DOMHelpers.DOMAppender;

    declare var UIkit: any;

    interface DisplayConfig {

        pageNumbersBefore: number,
        pageNumbersMiddle: number,
        pageNumbersAfter: number,
        showSpinnerAfterMilliSeconds: number;
        updateStatisticsEveryMilliSeconds: number;
        updateRecentThreadsEveryMilliSeconds: number;
        updateRecentThreadMessagesEveryMilliSeconds: number;
        renderNewMessageEveryMilliseconds: number;
    }

    declare const displayConfig: DisplayConfig;
    export const DisplayConfig = displayConfig;

    export interface SortInfo {

        orderBy: string,
        sortOrder: string
    }

    export async function changeContent(container: HTMLElement, handler: () => Promise<HTMLElement>): Promise<void> {

        let spinner = DOMHelpers.parseHTML('<div class="spinner-element"><div uk-spinner></div></div>');
        let disabledElement = DOMHelpers.parseHTML('<div class="disabled-element"></div>');

        let timer = setTimeout(() => {

            container.appendChild(disabledElement);
            container.appendChild(spinner);
            spinner.style.display = 'block';

        }, displayConfig.showSpinnerAfterMilliSeconds);

        try {
            let newPageContent = await handler();

            //no more need to show the spinner
            clearTimeout(timer);

            if (null == newPageContent) {
                disabledElement.remove();
                return;
            }

            container.innerHTML = '';
            container.appendChild(newPageContent);

            ViewsExtra.refreshMath(container);
        }
        finally {
            spinner.remove();
            disabledElement.remove();
        }
    }

    export function createDropdown(header: string | DOMAppender, content: any, properties?: any, classes?: any): DOMAppender {

        let propertiesString = '';
        if (null != properties) {

            propertiesString = Object.keys(properties).map(key => `${key}: ${properties[key]}`).join('; ');
        }

        let classString = '';
        if (null != classes) {
            classString = `class="${classes}"`
        }

        let element = new DOMAppender(`<div uk-dropdown="${propertiesString}" ${classString}>`, '</div>');

        let nav = new DOMAppender('<ul class="uk-nav uk-dropdown-nav">', '</ul>');
        element.append(nav);

        if (null != header) {
            let headerElement = new DOMAppender('<li class="uk-nav-header">', '</li>');
            nav.append(headerElement);

            if (header instanceof DOMAppender) {
                headerElement.append(header);
            }
            else {
                headerElement.appendString(header);
            }
        }

        nav.append(content);

        return element;
    }

    export declare type PageNumberChangeCallback = (value: number) => void;
    export declare type GetLinkForPageCallback = (value: number) => string;

    export function createPaginationControl(info: CommonEntities.PaginationInfo,
                                            onPageNumberChange: PageNumberChangeCallback,
                                            getLinkForPage: GetLinkForPageCallback) {

        let result = document.createElement('div');

        if (info.totalCount < 1) {

            return result[0];
        }

        let container = DOMHelpers.parseHTML(
            '<ul class="uk-pagination uk-flex-center uk-margin-remove-left uk-margin-remove-top uk-margin-remove-bottom" uk-margin></ul>');
        result.appendChild(container);

        let pageCount = CommonEntities.getPageCount(info);

        if (info.page > 0) {

            let previous = DOMHelpers.parseHTML('<li><a><span uk-pagination-previous></span></a></li>');
            container.appendChild(previous);
            previous.addEventListener('click', (ev) => {

                ev.preventDefault();
                onPageNumberChange(info.page - 1);
            });
        }

        function pageClickCallback(ev) {

            ev.preventDefault();
            onPageNumberChange(parseInt((ev.target as HTMLAnchorElement).text) - 1);
        }

        function addPageLink(pageNumber: number) {

            let listElement = document.createElement('li');
            container.appendChild(listElement);

            let link = document.createElement('a');
            listElement.appendChild(link);
            link.setAttribute('href', Pages.getUrl(getLinkForPage(pageNumber)));
            link.innerText = `${pageNumber + 1}`;

            link.addEventListener('click', pageClickCallback);

            if (pageNumber == info.page) {
                link.classList.add('uk-text-bold');
            }
        }

        function addEllipsis(): void {

            let listElement = document.createElement('li');
            container.appendChild(listElement);
            listElement.classList.add('pointer-cursor');

            let span = document.createElement('span');
            listElement.appendChild(span);
            span.innerText = '...';

            span.addEventListener('click', () => {

                const pageNumber = parseInt(prompt("Please enter the page number:")) || 0;
                if (pageNumber >= 1) {

                    onPageNumberChange(pageNumber - 1);
                }
            });
        }

        if (pageCount <= (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle + displayConfig.pageNumbersAfter)) {

            //display all pages
            for (let i = 0; i < pageCount; ++i) {

                addPageLink(i);
            }
        }
        else if (info.page < (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle - 1)) {

            //current page is among the first ones
            for (let i = 0; i < (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle); ++i) {

                addPageLink(i);
            }
            addEllipsis();
            for (let i = (pageCount - displayConfig.pageNumbersAfter); i < pageCount; ++i) {

                addPageLink(i);
            }
        }
        else if (info.page > (pageCount - (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle))) {

            //current page is among the last ones
            for (let i = 0; i < displayConfig.pageNumbersBefore; ++i) {

                addPageLink(i);
            }
            addEllipsis();
            for (let i = (pageCount - displayConfig.pageNumbersMiddle - displayConfig.pageNumbersAfter); i < pageCount; ++i) {

                addPageLink(i);
            }
        }
        else {
            for (let i = 0; i < displayConfig.pageNumbersBefore; ++i) {

                addPageLink(i);
            }
            addEllipsis();

            let start = info.page - Math.floor(displayConfig.pageNumbersMiddle / 2);
            for (let i = 0; i < displayConfig.pageNumbersMiddle; ++i) {

                addPageLink(start + i);
            }

            addEllipsis();
            for (let i = (pageCount - displayConfig.pageNumbersAfter); i < pageCount; ++i) {

                addPageLink(i);
            }
        }

        if (info.page < (pageCount - 1)) {

            let next = DOMHelpers.parseHTML('<li><a><span uk-pagination-next></span></a></li>');
            container.appendChild(next);
            next.addEventListener('click', (ev) => {

                ev.preventDefault();
                onPageNumberChange(info.page + 1);
            });
        }

        let total = document.createElement('span');
        result.appendChild(total);
        total.classList.add('uk-flex', 'uk-flex-center', 'uk-text-meta', 'pagination-total');
        total.innerText = `${DisplayHelpers.intToString(info.totalCount)} total`;

        return result;
    }

    export function createOrderByLabel(value: string, title: string, info: SortInfo): string {

        return `                <label><input class="uk-radio" type="radio" name="orderBy" value="${value}" ${value == info.orderBy ? 'checked' : ''}> ${title}</label>\n`;
    }

    export function createSortOrderOption(value: string, title: string, info: SortInfo): string {

        return `                    <option value="${value}" ${value == info.sortOrder ? 'selected' : ''}>${title}</option>\n`;
    }

    export const ThreadsWithTagData = 'data-tagname';
    export const UserThreadsData = 'data-threadusername';
    export const UserSubscribedThreadsData = 'data-subscribedthreadusername';
    export const UserMessagesData = 'data-threadmessageusername';

    function threadsWithTagLinkClicked(ev: Event) {

        ev.preventDefault();

        const tagName = DOMHelpers.getLink(ev).getAttribute(ThreadsWithTagData);

        new ThreadsPage().displayForTag(tagName);
    }

    function threadsOfUserLinkClicked(ev: Event) {

        ev.preventDefault();

        const userName = DOMHelpers.getLink(ev).getAttribute(UserThreadsData);

        new ThreadsPage().displayForUser(userName);
    }

    function subscribedThreadsOfUserLinkClicked(ev: Event) {

        ev.preventDefault();

        const userName = DOMHelpers.getLink(ev).getAttribute(UserSubscribedThreadsData);

        new ThreadsPage().displaySubscribedByUser(userName);
    }

    function threadMessagesOfUserLinkClicked(ev: Event) {

        ev.preventDefault();

        const userName = DOMHelpers.getLink(ev).getAttribute(UserMessagesData);

        new ThreadMessagesPage().displayForUser(userName);
    }

    function threadMessagesOfThreadLinkClicked(ev: Event) {

        ev.preventDefault();

        const threadId = DOMHelpers.getLink(ev).getAttribute('data-threadmessagethreadid');

        new ThreadMessagesPage().displayForThread(threadId);
    }

    function threadMessagesOfParentThreadLinkClicked(ev: Event) {

        ev.preventDefault();

        const threadMessageId = DOMHelpers.getLink(ev).getAttribute('data-threadmessagemessageid');

        new ThreadMessagesPage().displayForThreadMessage(threadMessageId);
    }

    function categoryLinkClicked(ev: Event) {

        ev.preventDefault();

        const link = DOMHelpers.getLink(ev);

        const categoryId = link.getAttribute('data-categoryid');
        const categoryName = link.getAttribute('data-categoryname') || '';

        new HomePage().displayCategory(categoryId, categoryName);
    }

    export function setupThreadsWithTagsLinks(element: HTMLElement): void {

        let links = element.querySelectorAll(`[${ThreadsWithTagData}]`);

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i);
            link.addEventListener('click', threadsWithTagLinkClicked);
        }
    }

    export function setupThreadsOfUsersLinks(element: HTMLElement): void {

        let links = element.querySelectorAll(`[${UserThreadsData}]`);

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i);
            link.addEventListener('click', threadsOfUserLinkClicked);
        }
    }

    export function setupSubscribedThreadsOfUsersLinks(element: HTMLElement): void {

        let links = element.querySelectorAll(`[${UserSubscribedThreadsData}]`);

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i);
            link.addEventListener('click', subscribedThreadsOfUserLinkClicked);
        }
    }

    export function setupThreadMessagesOfUsersLinks(element: HTMLElement): void {

        let links = element.querySelectorAll(`[${UserMessagesData}]`);

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i);
            link.addEventListener('click', threadMessagesOfUserLinkClicked);
        }
    }

    export function setupThreadMessagesOfThreadsLinks(element: HTMLElement): void {

        let links = element.querySelectorAll('[data-threadmessagethreadid]');

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i);
            link.addEventListener('click', threadMessagesOfThreadLinkClicked);
        }
    }

    export function setupThreadMessagesOfMessageParentThreadLinks(element: HTMLElement): void {

        let links = element.querySelectorAll('[data-threadmessagemessageid]');

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i);
            link.addEventListener('click', threadMessagesOfParentThreadLinkClicked);
        }
    }

    export function setupCategoryLinks(element: HTMLElement): void {

        let links = element.querySelectorAll('[data-categoryid]');

        for (let i = 0; i < links.length; ++i) {

            let link = links.item(i) as HTMLAnchorElement;
            setupCategoryLink(link);
        }
    }

    export function setupCategoryLink(link: HTMLAnchorElement): void {

        link.addEventListener('click', categoryLinkClicked);
    }

    export function scrollToTop(): void {

        window.scrollTo(0, 0);
        document.getElementById('pageContentContainer').scrollTo(0, 0);
    }

    export function scrollContainerToId(elementId: string): void {

        setTimeout(() => {

            let element = document.getElementById(elementId);
            let container = document.getElementById('pageContentContainer');
            if (element) {

                const top = $(element).offset().top - $(container).offset().top;
                container.scrollTo(0, top);
            }
        }, 100);
    }

    export function addPageNumber(title: string, pageNumber: number): string {

        if (pageNumber > 0) {

            title += ` – Page ${pageNumber + 1}`;
        }
        return title;
    }

    export function showModal(element: HTMLElement): void {

        UIkit.modal(element).show();
    }

    export function hideOpenModals(): void {

        const modals = document.querySelectorAll('.uk-modal.uk-open');
        for (let i = 0; i < modals.length; ++i) {

            const modal = modals.item(i);
            UIkit.modal(modal).hide();
        }
    }

    export function showPrimaryNotification(message: string, timeout: number = 3000): void {

        UIkit.notification({
            message: message,
            status: 'primary',
            timeout: timeout
        });
    }
}