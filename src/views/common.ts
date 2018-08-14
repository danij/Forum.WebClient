import {CommonEntities} from "../services/commonEntities";
import {DOMHelpers} from "../helpers/domHelpers";
import {ThreadsPage} from "../pages/threadsPage";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {HomePage} from "../pages/homePage";
import {ThreadMessagesPage} from "../pages/threadMessagesPage";
import {ViewsExtra} from "./extra";
import {Pages} from "../pages/common";
import {ThreadMessageCommentsPage} from "../pages/threadMessageCommentsPage";

export module Views {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;

    declare var UIkit: any;
    declare var jQuery: any;

    interface DisplayConfig {

        pageNumbersBefore: number,
        pageNumbersMiddle: number,
        pageNumbersAfter: number,
        showSpinnerAfterMilliSeconds: number;
        updateStatisticsEveryMilliSeconds: number;
        updateRecentThreadsEveryMilliSeconds: number;
        updateRecentThreadMessagesEveryMilliSeconds: number;
        searchThreadWaitMilliseconds: number;
        renderNewMessageEveryMilliseconds: number;
        useDashesForThreadNameInUrl: boolean;
    }

    declare const displayConfig: DisplayConfig;
    export const DisplayConfig = displayConfig;

    export interface SortInfo {

        orderBy: string,
        sortOrder: string
    }

    export async function changeContent(container: HTMLElement, handler: () => Promise<HTMLElement>,
                                        refreshMath: boolean = true): Promise<void> {

        const spinner = DOMHelpers.parseHTML('<div class="spinner-element"><div uk-spinner></div></div>');
        const disabledElement = DOMHelpers.parseHTML('<div class="disabled-element"></div>');

        const timer = setTimeout(() => {

            container.appendChild(disabledElement);
            container.appendChild(spinner);
            spinner.style.display = 'block';

        }, displayConfig.showSpinnerAfterMilliSeconds);

        try {
            container.scrollTop = 0;

            const newPageContent = await handler();

            //no more need to show the spinner
            clearTimeout(timer);

            if (null == newPageContent) {
                disabledElement.remove();
                return;
            }

            setContent(container, newPageContent, refreshMath);
        }
        finally {
            clearTimeout(timer);
            spinner.remove();
            disabledElement.remove();
        }
    }

    export function createDropdown(header: string | DOMAppender, content: any, properties?: any, classes?: any): DOMAppender {

        const propertiesString = Object.keys(properties || {}).map(key => `${key}: ${properties[key]}`).join('; ');

        let classString = '';
        if (null != classes) {

            classString = `class="${classes}"`
        }

        const element = dA(`<div uk-dropdown="${propertiesString}" ${classString}>`);

        const nav = dA('<ul class="uk-nav uk-dropdown-nav">');
        element.append(nav);

        if (null != header) {

            const headerElement = dA('<li class="uk-nav-header">');
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

        const result = cE('div');

        if (info.totalCount < 1) {

            return result;
        }

        const container = DOMHelpers.parseHTML(
            '<ul class="uk-pagination uk-flex-center uk-margin-remove-left uk-margin-remove-top uk-margin-remove-bottom" uk-margin></ul>');
        result.appendChild(container);

        const pageCount = CommonEntities.getPageCount(info);

        if (info.page > 0) {

            const previous = DOMHelpers.parseHTML('<li><a><span uk-pagination-previous></span></a></li>');
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

            const listElement = cE('li');
            container.appendChild(listElement);

            const link = cE('a');
            listElement.appendChild(link);
            link.setAttribute('href', Pages.getUrl(getLinkForPage(pageNumber)));
            link.innerText = `${pageNumber + 1}`;

            link.addEventListener('click', pageClickCallback);

            if (pageNumber == info.page) {
                link.classList.add('uk-text-bold');
            }
        }

        function addEllipsis(): void {

            const listElement = cE('li');
            container.appendChild(listElement);
            listElement.classList.add('pointer-cursor');

            const span = cE('span');
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

            const start = info.page - Math.floor(displayConfig.pageNumbersMiddle / 2);
            for (let i = 0; i < displayConfig.pageNumbersMiddle; ++i) {

                addPageLink(start + i);
            }

            addEllipsis();
            for (let i = (pageCount - displayConfig.pageNumbersAfter); i < pageCount; ++i) {

                addPageLink(i);
            }
        }

        if (info.page < (pageCount - 1)) {

            const next = DOMHelpers.parseHTML('<li><a><span uk-pagination-next></span></a></li>');
            container.appendChild(next);
            next.addEventListener('click', (ev) => {

                ev.preventDefault();
                onPageNumberChange(info.page + 1);
            });
        }

        const total = cE('span');
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
    export const UserWrittenThreadMessageCommentsData = 'data-threadmessagecommentswrittenbyusername';

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

    function threadMessageCommentsWrittenByUserLinkClicked(ev: Event) {

        ev.preventDefault();

        const userName = DOMHelpers.getLink(ev).getAttribute(UserWrittenThreadMessageCommentsData);

        new ThreadMessageCommentsPage().displayForUser(userName);
    }

    function threadMessagesOfThreadLinkClicked(ev: Event) {

        ev.preventDefault();

        const threadId = DOMHelpers.getLink(ev).getAttribute('data-threadmessagethreadid');

        new ThreadMessagesPage().displayForThread(threadId);
    }

    function threadMessagesOfParentThreadLinkClicked(ev: Event) {

        ev.preventDefault();

        const threadMessageId = DOMHelpers.getLink(ev).getAttribute('data-threadmessageid');

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

        const links = element.querySelectorAll(`[${ThreadsWithTagData}]`);

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', threadsWithTagLinkClicked);
        }
    }

    export function setupThreadsOfUsersLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserThreadsData}]`);

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', threadsOfUserLinkClicked);
        }
    }

    export function setupSubscribedThreadsOfUsersLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserSubscribedThreadsData}]`);

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', subscribedThreadsOfUserLinkClicked);
        }
    }

    export function setupThreadMessagesOfUsersLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserMessagesData}]`);

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', threadMessagesOfUserLinkClicked);
        }
    }

    export function setupThreadMessagesCommentsWrittenByUserLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserWrittenThreadMessageCommentsData}]`);

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', threadMessageCommentsWrittenByUserLinkClicked);
        }
    }

    export function setupThreadMessagesOfThreadsLinks(element: HTMLElement): void {

        const links = element.querySelectorAll('[data-threadmessagethreadid]');

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', threadMessagesOfThreadLinkClicked);
        }
    }

    export function setupThreadMessagesOfMessageParentThreadLinks(element: HTMLElement): void {

        const links = element.querySelectorAll('[data-threadmessageid]');

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i);
            link.addEventListener('click', threadMessagesOfParentThreadLinkClicked);
        }
    }

    export function setupCategoryLinks(element: HTMLElement): void {

        const links = element.querySelectorAll('[data-categoryid]');

        for (let i = 0; i < links.length; ++i) {

            const link = links.item(i) as HTMLAnchorElement;
            setupCategoryLink(link);
        }
    }

    export function setupCategoryLink(link: HTMLAnchorElement): void {

        link.addEventListener('click', categoryLinkClicked);
    }

    export function scrollContainerToId(elementId: string): void {

        setTimeout(() => {

            const element = document.getElementById(elementId);
            const container = document.getElementById('pageContentContainer');
            if (element) {

                const top = jQuery(element).offset().top - jQuery(container).offset().top;
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

    function showNotification(message: string, status: string, timeout: number = 3000): void {

        UIkit.notification({
            message: DOMHelpers.escapeStringForContent(message),
            status: status,
            timeout: timeout
        });
    }

    export function showPrimaryNotification(message: string) {

        showNotification(message, 'primary');
    }

    export function showDangerNotification(message: string): void {

        showNotification(message, 'danger');
    }

    export function showWarningNotification(message: string): void {

        showNotification(message, 'warning');
    }

    export function showSuccessNotification(message: string): void {

        showNotification(message, 'success');
    }

    export interface TabEntry {
        title: string;
        content: DOMAppender;
    }

    export function createTabs(entries: TabEntry[], selectedIndex: number = 0, alignment: string = 'left'): DOMAppender {

        const appender = dA('<div>');

        const header = dA(`<ul uk-tab class="uk-flex-${alignment}">`);
        appender.append(header);
        const content = dA('<ul class="uk-switcher">');
        appender.append(content);

        for (let i = 0; i < entries.length; ++i) {

            const entry = entries[i];

            const headerItem = dA(selectedIndex == i ? '<li class="uk-active">' : '<li>');
            header.append(headerItem);

            const headerLink = dA('<a href="#">');
            headerItem.append(headerLink);
            headerLink.appendString(entry.title);

            const contentItem = dA('<li>');
            content.append(contentItem);
            contentItem.append(entry.content);
        }

        return appender;
    }

    const animatedDisplaySelectorAttribute = 'animated-display-selector';
    const nrOfElementsToAnimate = 20;

    export function markElementForAnimatedDisplay(element: HTMLElement, selector: string): void {

        element.setAttribute(animatedDisplaySelectorAttribute, selector);
    }

    export function getElementMarkedForAnimatedDisplay(element: HTMLElement): HTMLElement {

        if (element.attributes.getNamedItem(animatedDisplaySelectorAttribute)) {

            return element;
        }

        return element.querySelector(`[${animatedDisplaySelectorAttribute}]`) as HTMLElement;
    }

    export function setContent(container: HTMLElement, newPageContent: HTMLElement, refreshMath: boolean) {

        container.innerHTML = '';

        const elementWithAnimationDisplaySelector = getElementMarkedForAnimatedDisplay(newPageContent);

        const animatedDisplaySelector = elementWithAnimationDisplaySelector
            ? elementWithAnimationDisplaySelector.getAttribute(animatedDisplaySelectorAttribute)
            : null;
        if (animatedDisplaySelector && animatedDisplaySelector.length) {

            setContentWithAnimation(container, newPageContent, animatedDisplaySelector, refreshMath);
        }
        else {
            container.appendChild(newPageContent);

            if (refreshMath) {

                ViewsExtra.refreshMath(container);
            }
        }
    }

    function transferChildElementsToArray(container: HTMLElement): HTMLElement[] {

        const result: HTMLElement[] = [];
        while (container.lastChild) {

            result.push(container.lastChild as HTMLElement);
            container.removeChild(container.lastChild);
        }
        return result.reverse();
    }

    function setContentWithAnimation(container: HTMLElement, newPageContent: HTMLElement, selector: string,
                                     refreshMath: boolean) {

        const subContainer = (newPageContent.querySelector(selector) as HTMLElement) || newPageContent;

        const subContainerChildren = transferChildElementsToArray(subContainer);

        const toAnimate = subContainerChildren.slice(0, nrOfElementsToAnimate);
        const toSimplyAdd = subContainerChildren.slice(nrOfElementsToAnimate, subContainerChildren.length);

        setTimeout(() => {

            for (let element of toAnimate) {

                element.classList.add('uk-animation-fade', 'uk-animation-fast');
                subContainer.appendChild(element);
            }
        }, 0);

        setTimeout(() => {

            for (let element of toSimplyAdd) {

                subContainer.appendChild(element);
            }
            if (refreshMath) {

                ViewsExtra.refreshMath(container);
            }
        }, 250);

        container.appendChild(newPageContent);
    }

    export function addClickIfElementExists(element, listener): void {

        if (element) {

            element.addEventListener('click', listener);
        }
    }
}