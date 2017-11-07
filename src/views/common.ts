import {CommonEntities} from "../services/commonEntities";

export module Views {

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

    export function createPaginationControl(info: CommonEntities.PaginationInfo) {

        return $('<ul class="uk-pagination uk-flex-center uk-margin-remove-top" uk-margin>\n' +
            '    <li><a href="#"><span uk-pagination-previous></span></a></li>\n' +
            '    <li><a href="#">1</a></li>\n' +
            '    <li class="uk-disabled"><span>...</span></li>\n' +
            '    <li><a href="#">5</a></li>\n' +
            '    <li><a href="#">6</a></li>\n' +
            '    <li class="uk-active"><span>7</span></li>\n' +
            '    <li><a href="#">8</a></li>\n' +
            '    <li><a href="#"><span uk-pagination-next></span></a></li>\n' +
            '</ul>')[0];
    }
}