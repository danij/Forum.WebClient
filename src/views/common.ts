export module Views {

    export function createDropdown(header: string|HTMLElement, content: any, properties?: any) {

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
}