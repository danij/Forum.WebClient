import {CommonEntities} from "../services/commonEntities";
import {DOMHelpers} from "../helpers/domHelpers";

export module Views {

    import DOMAppender = DOMHelpers.DOMAppender;

    interface DisplayConfig {

        pageNumbersBefore: number,
        pageNumbersMiddle: number,
        pageNumbersAfter: number,
        showSpinnerAfterMilliSeconds: number;
    }

    declare const displayConfig: DisplayConfig;

    export interface SortInfo {

        orderBy: string,
        sortOrder: string
    }

    export async function changeContent(containerElement: HTMLElement, handler: () => Promise<HTMLElement>) {

        let spinner = $('<div class="spinnerElement"><div uk-spinner></div></div>');
        let container = $(containerElement);
        let disabledElement = $('<div class="disabledElement"></div>');

        let timer = setTimeout(() => {

            container.append(disabledElement);
            container.append(spinner);
            spinner.show();

        }, displayConfig.showSpinnerAfterMilliSeconds);

        try {
            let newPageContent = await handler();

            //no more need to show the spinner
            clearTimeout(timer);

            if (null == newPageContent) {
                disabledElement.remove();
                return;
            }

            container.empty();
            container.append(newPageContent);
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

        let container = $('<ul class="uk-pagination uk-flex-center uk-margin-remove-top uk-margin-remove-bottom" uk-margin></ul>');

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

        return container[0];
    }

    export function createOrderByLabel(value: string, title: string, info: SortInfo) {

        return `                <label><input class="uk-radio" type="radio" name="orderBy" value="${value}" ${value == info.orderBy ? 'checked' : ''}> ${title}</label>\n`;
    }

    export function createSortOrderOption(value: string, title: string, info: SortInfo) {

        return `                    <option value="${value}" ${value == info.sortOrder ? 'selected' : ''}>${title}</option>\n`;
    }

}