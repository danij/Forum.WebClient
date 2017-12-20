import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";

export module EditViews {

    export function getInput(title: string, value: string = ''): string {

        return prompt(title, value) || '';
    }

    export function confirm(message: string = ''): boolean {

        return true == window.confirm(message);
    }

    export function doIfOk(promise: Promise<boolean>, callback: () => void) {

        promise.then(result => {

            if (result) {

                callback();
            }
        });
    }

    export function reloadPageIfOk(promise: Promise<boolean>) {

        doIfOk(promise, () => location.reload());
    }

    export function goToHomePageIfOk(promise: Promise<boolean>) {

        doIfOk(promise, () => location.href = Pages.getHomeUrl());
    }

    export function goToTagsPageIfOk(promise: Promise<boolean>) {

        doIfOk(promise, () => location.href = Pages.getUrl('tags'));
    }

    export function createAddNewButton(title): HTMLButtonElement {

        let result = document.createElement('button') as HTMLButtonElement;

        result.classList.add('uk-button', 'uk-button-primary', 'uk-button-small');
        result.innerText = title;

        return result;
    }

    export function wrapAddElements(...elements: HTMLElement[]): HTMLElement {

        let result = DOMHelpers.parseHTML('<div class="uk-flex uk-flex-center add-new-container"></div>');

        for (const element of elements) {

            result.appendChild(element);
        }

        return result;
    }

    export function createEditLink(tooltip: string, icon: string = 'file-edit'): HTMLAnchorElement {

        let result = document.createElement('a');

        let span = document.createElement('span');

        span.classList.add('uk-icon');
        span.classList.add('edit-link');
        span.setAttribute('uk-icon', 'icon: ' + icon);
        span.setAttribute('uk-tooltip', '');
        span.setAttribute('title', tooltip);

        result.appendChild(span);

        return result;
    }

    export function createDeleteLink(tooltip: string, classes: string = 'uk-float-right'): HTMLAnchorElement {

        let result = document.createElement('a');

        let span = document.createElement('span');

        span.classList.add('uk-icon');
        if (classes) {
            span.classList.add(...classes.trim().split(' '));
        }
        span.setAttribute('uk-icon', 'icon: trash');
        span.setAttribute('uk-tooltip', '');
        span.setAttribute('title', tooltip);

        result.appendChild(span);

        return result;
    }
}