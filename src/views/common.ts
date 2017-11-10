import {CommonEntities} from "../services/commonEntities";

export module Views {

    interface DisplayConfig {

        pageNumbersBefore: number,
        pageNumbersMiddle: number,
        pageNumbersAfter: number
    }

    declare const displayConfig: DisplayConfig;

    export function createDropdown(header: string | HTMLElement, content: any, properties?: any) {

        let propertiesString = '';
        if (null != properties) {

            propertiesString = Object.keys(properties).map(key => `${key}: ${properties[key]}`).join('; ');
        }

        let element = $(`<div uk-dropdown="${propertiesString}"></div>`);

        let nav = $('<ul class="uk-nav uk-dropdown-nav"></ul>');
        element.append(nav);

        if (null != header) {
            let headerElement = $('<li class="uk-nav-header"></li>');
            nav.append(headerElement);
            headerElement.append(header);
        }

        nav.append(content);

        return element[0];
    }

    export declare type PageNumberChangeCallback = (value: number) => void;

    export function createPaginationControl(info: CommonEntities.PaginationInfo,
                                            onPageNumberChange: Views.PageNumberChangeCallback) {

        let container = $('<ul class="uk-pagination uk-flex-center uk-margin-remove-top" uk-margin></ul>');

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
        else if (info.page <= (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle)) {

            //current page is among the first ones
            for (let i = 0; i < (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle); ++i) {

                addPageLink(i);
            }
            addEllipsis();
            for (let i = (pageCount - displayConfig.pageNumbersAfter); i < pageCount; ++i) {

                addPageLink(i);
            }
        }
        else if (info.page >= (pageCount - (displayConfig.pageNumbersAfter + displayConfig.pageNumbersMiddle))) {

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
}