import {CommonEntities} from '../services/commonEntities';
import {DOMHelpers} from '../helpers/domHelpers';
import {ThreadsPage} from '../pages/threadsPage';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {HomePage} from '../pages/homePage';
import {ThreadMessagesPage} from '../pages/threadMessagesPage';
import {ViewsExtra} from './extra';
import {Pages} from '../pages/common';
import {ThreadMessageCommentsPage} from '../pages/threadMessageCommentsPage';
import {DocumentationView} from './documentationView';
import {PageActions} from '../pages/action';
import {AttachmentsPage} from "../pages/attachmentsPage";
import {AttachmentsRepository} from "../services/attachmentsRepository";
import {RequestHandler} from "../services/requestHandler";

export module Views {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;
    import IDocumentationCallback = PageActions.IDocumentationCallback;

    declare var UIkit: any;

    interface LengthConfig {

        min: number,
        max: number
    }

    interface DisplayConfig {

        pageNumbersBefore: number,
        pageNumbersMiddle: number,
        pageNumbersAfter: number,
        showSpinnerAfterMilliSeconds: number;
        updateStatisticsEveryMilliSeconds: number;
        checkAuthenticationEveryMilliSeconds: number;
        searchThreadWaitMilliseconds: number;
        renderMessagePreviewEveryMilliseconds: number;
        useDashesForThreadNameInUrl: boolean;
        privacyPolicyDocName: string;
        termsOfServiceDocName: string;
        userNameLengths: LengthConfig;
        threadNameLengths: LengthConfig;
        messageContentLengths: LengthConfig;
        privateMessageContentLengths: LengthConfig;
        attachmentNameLengths: LengthConfig;
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

    export function createPaginationControl(info: CommonEntities.PaginationInfo, totalString: string,
                                            onPageNumberChange: PageNumberChangeCallback,
                                            getLinkForPage: GetLinkForPageCallback): HTMLElement {

        const result = cE('div');

        if (info.totalCount < 1) {

            return result;
        }

        const container = DOMHelpers.parseHTML(
            '<ul class="uk-pagination uk-flex-center uk-margin-remove-left uk-margin-remove-top uk-margin-remove-bottom" uk-margin>' +
            '<li uk-no-boot>Page:</li>' +
            '</ul>');
        result.appendChild(container);

        const pageCount = CommonEntities.getPageCount(info);

        if (info.page > 0) {

            const previous = DOMHelpers.parseHTML('<li><a><span uk-pagination-previous></span></a></li>');
            container.appendChild(previous);
            Views.onClick(previous, () => { onPageNumberChange(info.page - 1); });
        }

        function pageClickCallback(ev) {

            ev.preventDefault();
            onPageNumberChange(parseInt((ev.target as HTMLAnchorElement).text) - 1);
        }

        function addPageLink(pageNumber: number) {

            const listElement = cE('li');
            listElement.setAttribute('uk-no-boot', '');
            container.appendChild(listElement);

            const link = cE('a');
            listElement.appendChild(link);
            link.setAttribute('href', Pages.getUrl(getLinkForPage(pageNumber)));
            link.innerText = `${pageNumber + 1}`;

            Views.onClick(link, pageClickCallback);

            if (pageNumber == info.page) {

                DOMHelpers.addClasses(link, 'uk-text-bold');
            }
        }

        function addEllipsis(): void {

            const listElement = cE('li');
            listElement.setAttribute('uk-no-boot', '');
            container.appendChild(listElement);
            DOMHelpers.addClasses(listElement, 'pointer-cursor');

            const span = cE('span');
            listElement.appendChild(span);
            span.innerText = '...';

            Views.onClick(span, () => {

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
            Views.onClick(next, () => { onPageNumberChange(info.page + 1); });
        }

        const total = cE('span');
        total.setAttribute('uk-no-boot', '');
        result.appendChild(total);
        DOMHelpers.addClasses(total, 'uk-flex', 'uk-flex-center', 'uk-text-meta', 'pagination-total');
        total.innerText = `${DisplayHelpers.intToString(info.totalCount)} ${totalString}`;

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
    export const UserAddedAttachmentsData = 'data-attachmentsaddedbyusername';

    function threadsWithTagLinkClicked(ev: Event) {

        const tagName = DOMHelpers.getLink(ev).getAttribute(ThreadsWithTagData);

        new ThreadsPage().displayForTag(tagName);
    }

    function threadsOfUserLinkClicked(ev: Event) {

        const userName = DOMHelpers.getLink(ev).getAttribute(UserThreadsData);

        new ThreadsPage().displayForUser(userName);
    }

    function subscribedThreadsOfUserLinkClicked(ev: Event) {

        const userName = DOMHelpers.getLink(ev).getAttribute(UserSubscribedThreadsData);

        new ThreadsPage().displaySubscribedByUser(userName);
    }

    function threadMessagesOfUserLinkClicked(ev: Event) {

        const userName = DOMHelpers.getLink(ev).getAttribute(UserMessagesData);

        new ThreadMessagesPage().displayForUser(userName);
    }

    function threadMessageCommentsWrittenByUserLinkClicked(ev: Event) {

        const userName = DOMHelpers.getLink(ev).getAttribute(UserWrittenThreadMessageCommentsData);

        new ThreadMessageCommentsPage().displayForUser(userName);
    }

    function attachmentsAddedByUserLinkClicked(ev: Event) {

        const userName = DOMHelpers.getLink(ev).getAttribute(UserAddedAttachmentsData);

        new AttachmentsPage().displayForUser(userName);
    }

    function threadMessagesOfThreadLinkClicked(ev: Event) {

        const threadId = DOMHelpers.getLink(ev).getAttribute('data-threadmessagethreadid');
        const threadPageString = DOMHelpers.getLink(ev).getAttribute('data-threadmessagethreadpage');

        const threadPage = parseInt(threadPageString) || 0;

        new ThreadMessagesPage().displayForThread(threadId, threadPage);
    }

    function threadMessagesOfParentThreadLinkClicked(ev: Event) {

        const threadMessageId = DOMHelpers.getLink(ev).getAttribute('data-threadmessageid');

        new ThreadMessagesPage().displayForThreadMessage(threadMessageId);
    }

    function categoryLinkClicked(ev: Event) {

        const link = DOMHelpers.getLink(ev);

        const categoryId = link.getAttribute('data-categoryid');
        const categoryName = link.getAttribute('data-categoryname') || '';

        new HomePage().displayCategory(categoryId, categoryName);
    }

    export function setupThreadsWithTagsLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${ThreadsWithTagData}]`);

        DOMHelpers.forEach(links, link => {

            Views.onClick(link, threadsWithTagLinkClicked);
        });
    }

    export function setupThreadsOfUsersLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserThreadsData}]`);

        DOMHelpers.forEach(links, link => { Views.onClick(link, threadsOfUserLinkClicked); });
    }

    export function setupSubscribedThreadsOfUsersLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserSubscribedThreadsData}]`);

        DOMHelpers.forEach(links, link => { Views.onClick(link, subscribedThreadsOfUserLinkClicked); });
    }

    export function setupThreadMessagesOfUsersLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserMessagesData}]`);

        DOMHelpers.forEach(links, link => { Views.onClick(link, threadMessagesOfUserLinkClicked); });
    }

    export function setupThreadMessagesCommentsWrittenByUserLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserWrittenThreadMessageCommentsData}]`);

        DOMHelpers.forEach(links, link => { Views.onClick(link, threadMessageCommentsWrittenByUserLinkClicked); });
    }

    export function setupAttachmentsAddedByUserLinks(element: HTMLElement): void {

        const links = element.querySelectorAll(`[${UserAddedAttachmentsData}]`);

        DOMHelpers.forEach(links, link => { Views.onClick(link, attachmentsAddedByUserLinkClicked); });
    }

    export function setupThreadMessagesOfThreadsLinks(element: HTMLElement): void {

        const links = element.querySelectorAll('[data-threadmessagethreadid]');

        DOMHelpers.forEach(links, link => { Views.onClick(link, threadMessagesOfThreadLinkClicked); });
    }

    export function setupThreadMessagesOfMessageParentThreadLinks(element: HTMLElement): void {

        const links = element.querySelectorAll('[data-threadmessageid]');

        DOMHelpers.forEach(links, link => { Views.onClick(link, threadMessagesOfParentThreadLinkClicked); });
    }

    export function setupCategoryLinks(element: HTMLElement): void {

        const links = element.querySelectorAll('[data-categoryid]');

        DOMHelpers.forEach(links, setupCategoryLink);
    }

    export function setupCategoryLink(link: HTMLAnchorElement): void {

        Views.onClick(link, categoryLinkClicked);
    }

    export function scrollContainerTo(element: HTMLElement): void {

        setTimeout(() => {

            element.scrollIntoView();
        }, 500);
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
        DOMHelpers.forEach(modals, modal => UIkit.modal(modal).hide());
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

    export function setContent(container: HTMLElement, newPageContent: HTMLElement, refreshMath: boolean) {

        const scrollContainer = DOMHelpers.goUpUntil(container, e => 'page-content-container' === e.id);

        if (scrollContainer && ('page-content-container' === scrollContainer.id)) {

            scrollContainer.parentElement.children[0].scrollIntoView();
        }
        else {

            container.scrollIntoView();
        }
        container.innerHTML = '';

        container.appendChild(newPageContent);

        if (refreshMath) {

            ViewsExtra.refreshMath(container);
        }
    }

    export function addClickIfElementExists(element, listener): void {

        if (element) {

            Views.onClick(element, listener);
        }
    }

    function closeDropdowns(): void {

        document.body.click();
    }

    export function onClick(element: HTMLElement, callback: (ev) => void): void {

        element.addEventListener('click', ev => {

            closeDropdowns();

            ev.preventDefault();
            callback(ev);
        });
    }

    export function onClickRemoveListeners(element: HTMLElement, callback: (ev) => void): void {

        onClick(DOMHelpers.removeEventListeners(element), callback);
    }

    export function onClickWithSpinner<T>(element: HTMLButtonElement, callback: (ev) => Promise<T>): void {

        if (element.classList.contains('uk-disabled')) return;

        if (element.children.length) {

            console.error('onClickWithSpinner only works with elements without children');
            return;
        }

        onClick(element, async (ev) => {

            const text = element.innerText;
            const primaryButton = element.classList.contains('uk-button-primary');

            try {

                DOMHelpers.addClasses(element, 'uk-disabled');
                DOMHelpers.removeClasses(element, 'uk-button-primary');

                element.innerText = '';
                element.appendChild(DOMHelpers.parseHTML('<div uk-spinner></div>'))

                await callback(ev);
            }
            finally {

                element.innerText = text;
                DOMHelpers.removeClasses(element, 'uk-disabled');
                if (primaryButton) {

                    DOMHelpers.addClasses(element, 'uk-button-primary');
                }
            }
        });
    }

    export function setupKnownDocumentationLinks(element: HTMLElement, docCallback: IDocumentationCallback): void {

        const knownClasses = {

            "privacy-link": displayConfig.privacyPolicyDocName,
            "tos-link": displayConfig.termsOfServiceDocName
        };

        for (let className of Object.getOwnPropertyNames(knownClasses)) {

            DOMHelpers.forEach(element.getElementsByClassName(className), element => {

               onClick(element, () => DocumentationView.showDocumentationInModal(knownClasses[className],
                   docCallback));
            });
        }
    }

    export function clearActiveHeaderLinks() {

        DOMHelpers.forEach(document.getElementsByClassName('uk-navbar-nav'), nav => {

            DOMHelpers.forEach(nav.getElementsByTagName('li'), link => {

                DOMHelpers.removeClasses(link, 'uk-active');
            })
        })
    }

    let lastAutoResize: number = 0;

    export function enableAutoResize(element: HTMLElement): void {

        const targetClass = 'auto-resize-target';
        DOMHelpers.addClasses(element, targetClass);

        element.addEventListener('dblclick', ev => {

            const now = new Date().getTime();
            if ((now - lastAutoResize) > 1000) {

                const target = DOMHelpers.goUpUntil(ev.target as HTMLElement, e => e.classList.contains(targetClass));

                if (target) {

                    target.classList.toggle('no-max-height');
                }
            }
            lastAutoResize = now;
        });
    }

    export async function setupUpload(uploadElement: HTMLElement, progressElement: HTMLProgressElement, url: string,
                                      afterUpload: (newAttachment: AttachmentsRepository.Attachment) => void): Promise<void> {

        const doubleSubmit = await RequestHandler.getDoubleSubmitCookie();

        UIkit.upload(uploadElement, {

            url: url,
            multiple: false,
            beforeSend: environment => {

                environment.headers[RequestHandler.getDoubleSubmitHeaderName()] = doubleSubmit;
            },
            loadStart: e => {

                DOMHelpers.unHide(progressElement);
                progressElement.max = e.total;
                progressElement.value = e.loaded;
            },
            progress: e => {

                progressElement.max = e.total;
                progressElement.value = e.loaded;
            },
            loadEnd: e => {

                progressElement.max = e.total;
                progressElement.value = e.loaded;
            },
            error: ex => {

                DOMHelpers.hide(progressElement);
                Views.showDangerNotification('Error uploading file: ' + ex.message);
            },
            completeAll: (request: XMLHttpRequest) => {

                try {

                    afterUpload(RequestHandler.parseContentAs(request));
                }
                catch (ex) {

                    Views.showDangerNotification('Error uploading file: ' + ex.message);
                }
                setTimeout(() => {

                    DOMHelpers.hide(progressElement);
                }, 500);
            }
        })
    }
}