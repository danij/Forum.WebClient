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

    export function createEditLink(tooltip): HTMLAnchorElement {

        let result = document.createElement('a');

        result.classList.add('uk-icon');
        result.classList.add('edit-link');
        result.setAttribute('uk-icon', 'icon: file-edit');
        result.setAttribute('uk-tooltip', '');
        result.setAttribute('title', tooltip);

        return result;
    }

    export function createDeleteLink(tooltip): HTMLAnchorElement {

        let result = document.createElement('a');

        result.classList.add('uk-icon');
        result.classList.add('uk-float-right');
        result.setAttribute('uk-icon', 'icon: trash');
        result.setAttribute('uk-tooltip', '');
        result.setAttribute('title', tooltip);

        return result;
    }
}