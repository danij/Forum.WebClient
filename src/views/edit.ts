import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {ViewsExtra} from "./extra";
import {Views} from "./common";

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

    export function createEditLink(tooltip: string, icon: string = 'file-edit',
                                   classes: string[] = ['edit-link']): HTMLAnchorElement {

        let result = document.createElement('a');

        let span = document.createElement('span');

        span.classList.add('uk-icon');
        if (classes && classes.length) {

            for (let cls of classes) {

                span.classList.add(cls);
            }
        }
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

    export class EditControl {

        private textArea: HTMLTextAreaElement;
        private resultContainer: HTMLDivElement;

        constructor(container: HTMLElement) {

            this.textArea = document.createElement('textarea');
            this.textArea.classList.add('uk-textarea');

            this.resultContainer = document.createElement('div');
            this.resultContainer.classList.add('edit-preview', 'message-content');

            let grid = document.createElement('div');
            container.appendChild(grid);
            grid.classList.add('uk-grid');
            grid.setAttribute('uk-grid', '');

            grid.appendChild(this.textArea);
            grid.appendChild(this.resultContainer);

            this.setupEvents();
        }

        getText(): string {

            return this.textArea.value;
        }

        private setupEvents(): void {

            let previousText = '';
            setInterval(() => {

                let currentText = this.getText();
                if (currentText != previousText) {

                    previousText = currentText;
                    this.updateContent(currentText);
                }
            }, Views.DisplayConfig.renderNewMessageEveryMilliseconds);
        }

        private updateContent(text: string): void {

            this.resultContainer.innerHTML = ViewsExtra.expandContent(text);
            ViewsExtra.refreshMath(this.resultContainer);
        }
    }
}