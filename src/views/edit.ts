import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {ViewsExtra} from "./extra";
import {Views} from "./common";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";

export module EditViews {

    export function getInput(title: string, value: string = ''): string {

        return prompt(title, value);
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

        const result = document.createElement('button') as HTMLButtonElement;

        result.classList.add('uk-button', 'uk-button-primary', 'uk-button-small');
        result.innerText = title;

        return result;
    }

    export function wrapAddElements(...elements: HTMLElement[]): HTMLElement {

        const result = DOMHelpers.parseHTML('<div class="uk-flex uk-flex-center add-new-container"></div>');

        for (const element of elements) {

            result.appendChild(element);
        }

        return result;
    }

    export function createEditLink(tooltip: string, icon: string = 'file-edit',
                                   classes: string[] = ['edit-link']): HTMLAnchorElement {

        const result = document.createElement('a');

        const span = document.createElement('span');

        span.classList.add('uk-icon');
        if (classes && classes.length) {

            for (const cls of classes) {

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

        const result = document.createElement('a');

        const span = document.createElement('span');

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

        constructor(container: HTMLElement, initialText: string = '') {

            this.textArea = document.createElement('textarea');
            this.textArea.classList.add('uk-textarea');
            this.textArea.value = initialText;

            const previewContainer = document.createElement('div');
            previewContainer.classList.add('edit-preview', 'message-content', 'render-math');
            previewContainer.appendChild(DOMHelpers.parseHTML('<span class="uk-text-meta">Message Preview</span>'));

            previewContainer.appendChild(this.resultContainer = document.createElement('div'));

            const grid = document.createElement('div');
            container.appendChild(grid);
            grid.classList.add('uk-grid');
            grid.setAttribute('uk-grid', '');

            const textAreaContainer = document.createElement('div');
            textAreaContainer.classList.add('edit-control-container');
            textAreaContainer.appendChild(this.createEditControls());
            textAreaContainer.appendChild(this.textArea);

            grid.appendChild(textAreaContainer);
            grid.appendChild(previewContainer);

            this.setupEvents();
        }

        getText(): string {

            return this.textArea.value;
        }

        insertQuote(message: ThreadMessageRepository.ThreadMessage): void {

            const quotedContent = message.content.split(/\n/).map((line) => `> ${line}`).join('\n');
            this.textArea.value += `\n\n|_${message.createdBy.name} @ ${DisplayHelpers.getDateTime(message.created)}_|\n|:-:|\n\n${quotedContent}\n\n`;
        }

        private setupEvents(): void {

            let previousText = '';
            setInterval(() => {

                const currentText = this.getText();
                if (currentText != previousText) {

                    previousText = currentText;
                    this.updateContent(currentText);
                }
            }, Views.DisplayConfig.renderNewMessageEveryMilliseconds);
        }

        private updateContent(text: string): void {

            this.resultContainer.innerHTML = ViewsExtra.expandContent(text);
            ViewsExtra.adjustMessageContent(this.resultContainer.parentNode as HTMLElement);
            ViewsExtra.refreshMath(this.resultContainer);
        }

        private createEditControls(): HTMLElement {

            const list = document.createElement('ul');
            list.classList.add('uk-iconnav');

            const actions = [
                {icon: 'bold', title: 'Make selection bold', callback: () => this.addBold()},
                {icon: 'italic', title: 'Make selection italic', callback: () => this.addItalic()},
                {icon: 'code', title: 'Make selection monospace', callback: () => this.addMonospace()},
                {icon: 'strikethrough', title: 'Make selection strikethrough', callback: () => this.addStrikeThrough()},
                null,
                {icon: 'list', title: 'Add list', callback: () => this.addList()},
                {icon: 'table', title: 'Add table', callback: () => this.addTable()},
                {icon: 'minus', title: 'Add horizontal rule', callback: () => this.addHorizontalRule()},
                null,
                {icon: 'link', title: 'Add link', callback: () => this.addLink()},
                {icon: 'image', title: 'Add image reference', callback: () => this.addImage()}
            ];

            for (const action of actions) {

                const listElement = document.createElement('li');
                list.appendChild(listElement);

                if (action) {

                    const link = document.createElement('a');
                    listElement.appendChild(link);

                    link.setAttribute('uk-icon', `icon: ${action.icon}`);
                    link.setAttribute('title', action.title);
                    link.setAttribute('uk-tooltip', '');
                    link.addEventListener('click', (ev) => {

                        ev.preventDefault();
                        action.callback();
                    });
                }
            }

            return list;
        }

        private addBold(): void {

            this.replaceTextAtCurrentPosition((value) => `**${value}**`);
        }

        private addItalic(): void {

            this.replaceTextAtCurrentPosition((value) => `*${value}*`);
        }

        private addMonospace(): void {

            this.replaceTextAtCurrentPosition((value) => `\`${value}\``);
        }

        private addStrikeThrough(): void {

            this.replaceTextAtCurrentPosition((value) => `~~${value}~~`);
        }

        private addList(): void {

            this.replaceTextAtCurrentPosition((value) => {

                if (value.length) {

                    return value.split('\n').map((v) => `* ${v}`).join('\n');
                }
                else {

                    return '\n' +
                        '* Item 1\n' +
                        '* Item 2\n' +
                        '* Item 3\n\n';
                }
            });
        }

        private addTable(): void {

            this.addTextAtCurrentPosition('\n' +
                '|Col 1|Col 2|Col 3|\n' +
                '|:-|:-:|-:|\n' +
                '|1|2|3|\n' +
                '|aa|bb|cc|\n\n');
        }

        private addHorizontalRule(): void {

            this.addTextAtCurrentPosition('\n\n---\n\n');
        }

        private addLink(): void {

            const link = getInput('Please enter the link to add');
            if (link) {

                const title = getInput('Please enter the title for the link');

                if (title) {

                    this.addTextAtCurrentPosition(`[${title}](${link})`);
                }
                else {

                    this.addTextAtCurrentPosition(link);
                }
            }
        }

        private addImage(): void {

            const link = getInput('Please enter the link to the image');
            if (link) {

                const title = getInput('Please enter the image title');
                const altText = title || link;

                if (title) {

                    this.addTextAtCurrentPosition(`![${altText}](${link} "${title}")`);
                } else {

                    this.addTextAtCurrentPosition(`![${altText}](${link})`);
                }
            }
        }

        private replaceTextAtCurrentPosition(replaceFn: (value: string) => string): void {

            const selectionStart = this.textArea.selectionStart;
            const selectionEnd = this.textArea.selectionEnd;
            const currentSelection = this.textArea.value.substring(selectionStart, selectionEnd);

            const replacement = replaceFn(currentSelection);

            this.textArea.value = this.textArea.value.substr(0, selectionStart) + replacement +
                this.textArea.value.substring(selectionEnd);
        }

        private addTextAtCurrentPosition(value: string): void {

            this.textArea.value = this.textArea.value.substr(0, this.textArea.selectionStart) +
                value + this.textArea.value.substring(this.textArea.selectionStart);
        }
    }
}