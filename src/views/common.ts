import {CommonEntities} from "../services/commonEntities";
import {DOMHelpers} from "../helpers/domHelpers";
import {ThreadsPage} from "../pages/threadsPage";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {HomePage} from "../pages/homePage";
import {ThreadMessagesPage} from "../pages/threadMessagesPage";
import {ViewsExtra} from "./extra";

export module Views {

    import DOMAppender = DOMHelpers.DOMAppender;

    interface DisplayConfig {

        pageNumbersBefore: number,
        pageNumbersMiddle: number,
        pageNumbersAfter: number,
        showSpinnerAfterMilliSeconds: number;
        updateStatisticsEveryMilliSeconds: number;
        updateRecentThreadsEveryMilliSeconds: number;
        updateRecentThreadMessagesEveryMilliSeconds: number;
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

    export function createPaginationControl(info: CommonEntities.PaginationInfo,
                                            onPageNumberChange: Views.PageNumberChangeCallback) {

        let result = $('<div></div>');

        if (info.totalCount < 1) {

            return result[0];
        }

        let container = $('<ul class="uk-pagination uk-flex-center uk-margin-remove-left uk-margin-remove-top uk-margin-remove-bottom" uk-margin></ul>');
        result.append(container);

        let pageCount = CommonEntities.getPageCount(info);

        if (info.page > 0) {

            let previous = $('<li><a><span uk-pagination-previous></span></a></li>');
            container.append(previous);
            previous.on('click', (e) => {

                onPageNumberChange(info.page - 1);
                e.preventDefault();
            });
        }

        function pageClickCallback(e) {

            onPageNumberChange(parseInt((e.target as HTMLAnchorElement).text) - 1);
            e.preventDefault();
        }

        function addPageLink(pageNumber: number) {

            let listElement = $('<li></li>');
            container.append(listElement[0]);

            let link = $(`<a>${pageNumber + 1}</a>`);
            listElement.append(link);
            link.on('click', pageClickCallback);

            if (pageNumber == info.page) {
                link.addClass('uk-text-bold');
            }
        }

        function addEllipsis(): void {

            let listElement = $('<li class="pointer-cursor"></li>');
            container.append(listElement[0]);

            let span = $('<span>...</span>');
            listElement.append(span);

            span.on('click', () => {

                const pageNumber = (parseInt(prompt("Please enter the page number:")) || 1) - 1;
                onPageNumberChange(pageNumber);
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

            let next = $('<li><a href="#"><span uk-pagination-next></span></a></li>');
            container.append(next);
            next.on('click', (e) => {

                onPageNumberChange(info.page + 1);
                e.preventDefault();
            });
        }

        result.append($(`<span class="uk-flex uk-flex-center uk-text-meta pagination-total">${DisplayHelpers.intToString(info.totalCount)} total</span>`));

        return result[0];
    }

    export function createOrderByLabel(value: string, title: string, info: SortInfo) {

        return `                <label><input class="uk-radio" type="radio" name="orderBy" value="${value}" ${value == info.orderBy ? 'checked' : ''}> ${title}</label>\n`;
    }

    export function createSortOrderOption(value: string, title: string, info: SortInfo) {

        return `                    <option value="${value}" ${value == info.sortOrder ? 'selected' : ''}>${title}</option>\n`;
    }

    export const ThreadsWithTagData = 'data-tagname';
    export const UserThreadsData = 'data-threadusername';
    export const UserMessagesData = 'data-threadmessageusername';

    function threadsWithTagLinkClicked(ev: Event) {

        const tagName = (ev.target as HTMLElement).getAttribute(ThreadsWithTagData);

        new ThreadsPage().displayForTag(tagName);

        ev.preventDefault();
    }

    function threadsOfUserLinkClicked(ev: Event) {

        const userName = (ev.target as HTMLElement).getAttribute(UserThreadsData);

        new ThreadsPage().displayForUser(userName);

        ev.preventDefault();
    }

    function threadMessagesOfUserLinkClicked(ev: Event) {

        const userName = (ev.target as HTMLElement).getAttribute(UserMessagesData);

        new ThreadMessagesPage().displayForUser(userName);

        ev.preventDefault();
    }

    function threadMessagesOfThreadLinkClicked(ev: Event) {

        const threadId = (ev.target as HTMLElement).getAttribute('data-threadmessagethreadid');

        new ThreadMessagesPage().displayForThread(threadId);

        ev.preventDefault();
    }

    function threadMessagesOfParentThreadLinkClicked(ev: Event) {

        const threadMessageId = (ev.target as HTMLElement).getAttribute('data-threadmessagemessageid');

        new ThreadMessagesPage().displayForThreadMessage(threadMessageId);

        ev.preventDefault();
    }

    function categoryLinkClicked(ev: Event) {

        const link = ev.target as HTMLElement;

        const categoryId = link.getAttribute('data-categoryid');
        const categoryName = link.getAttribute('data-categoryname') || '';

        new HomePage().displayCategory(categoryId, categoryName);

        ev.preventDefault();
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
}