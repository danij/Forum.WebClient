import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {ViewsExtra} from './extra';
import {Views} from './common';
import {ThreadMessageRepository} from '../services/threadMessageRepository';
import {UserCache} from "../services/userCache";

export module EditViews {

    import cE = DOMHelpers.cE;
    import refreshMath = ViewsExtra.refreshMath;

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

        const result = cE('button') as HTMLButtonElement;

        DOMHelpers.addClasses(result, 'uk-button', 'uk-button-primary', 'uk-button-small');
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

        const result = cE('a') as HTMLAnchorElement;

        const span = cE('span');

        DOMHelpers.addClasses(span, 'uk-icon');
        if (classes && classes.length) {

            DOMHelpers.addClasses(span, ...classes);
        }
        span.setAttribute('uk-icon', 'icon: ' + icon);
        span.setAttribute('uk-tooltip', '');
        span.setAttribute('title', tooltip);

        result.appendChild(span);

        return result;
    }

    export function createDeleteLink(tooltip: string, classes: string = 'uk-float-right'): HTMLAnchorElement {

        const result = cE('a') as HTMLAnchorElement;

        const span = cE('span');

        DOMHelpers.addClasses(span, 'uk-icon');
        if (classes) {

            DOMHelpers.addClasses(span, ...classes.trim().split(' '));
        }
        span.setAttribute('uk-icon', 'icon: trash');
        span.setAttribute('uk-tooltip', '');
        span.setAttribute('title', tooltip);

        result.appendChild(span);

        return result;
    }

    export class EditControl {

        private textArea: HTMLTextAreaElement;
        private previewContainer: HTMLDivElement;
        private resultContainer: HTMLDivElement;

        constructor(container: HTMLElement, initialText: string = '') {

            this.textArea = cE('textarea') as HTMLTextAreaElement;
            DOMHelpers.addClasses(this.textArea, 'uk-textarea');
            this.textArea.value = initialText;

            this.previewContainer = cE('div') as HTMLDivElement;
            DOMHelpers.addClasses(this.previewContainer, 'edit-preview', 'message-content', 'render-math');
            this.previewContainer.appendChild(DOMHelpers.parseHTML('<span class="uk-text-meta">Message Preview</span>'));

            this.resultContainer = cE('div') as HTMLDivElement;
            this.previewContainer.appendChild(this.resultContainer);

            const grid = cE('div');
            container.appendChild(grid);
            DOMHelpers.addClasses(grid, 'uk-grid');
            grid.setAttribute('uk-grid', '');

            const textAreaContainer = cE('div');
            DOMHelpers.addClasses(textAreaContainer, 'edit-control-container');
            textAreaContainer.appendChild(this.createEditControls());
            textAreaContainer.appendChild(this.textArea);

            grid.appendChild(textAreaContainer);
            grid.appendChild(this.previewContainer);

            this.setupEvents();
        }

        getTextInternal(): string {

            return this.textArea.value;
        }

        async getText(): Promise<string> {

            return await this.replaceUserNameReferences(this.getTextInternal());
        }

        insertQuote(message: ThreadMessageRepository.ThreadMessage): void {

            const quotedContent = message.content.split(/\n/).map((line) => `> ${line}`).join('\n');
            this.textArea.value += `\n\n> quote|${message.created}|@${message.createdBy.id}@\n>\n${quotedContent}`;
        }

        private setupEvents(): void {

            let previousText = '';
            setInterval(() => {

                const currentText = this.getTextInternal();
                if (currentText != previousText) {

                    previousText = currentText;
                    this.updateContent(currentText);
                }
            }, Views.DisplayConfig.renderMessagePreviewEveryMilliseconds);
        }

        private async updateContent(text: string): Promise<void> {

            text = await this.replaceUserNameReferences(text);
            await ViewsExtra.searchUsersById([text]);

            this.resultContainer.innerHTML = ViewsExtra.expandContent(text);
            this.adjustGeneratedContent(this.resultContainer);

            ViewsExtra.adjustMessageContent(this.resultContainer.parentNode as HTMLElement);
            ViewsExtra.refreshMath(this.previewContainer);
        }

        private adjustGeneratedContent(element: HTMLElement): void {

            const tables = element.getElementsByTagName('table');
            DOMHelpers.forEach(tables, table => {

                DOMHelpers.addClasses(table, 'uk-table', 'uk-table-small', 'uk-table-striped');
            });
        }

        private createEditControls(): HTMLElement {

            const list = cE('ul');
            DOMHelpers.addClasses(list, 'uk-iconnav');

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
                {icon: 'file-edit', title: 'Add code', callback: () => this.addCode()},
                {math: '$\\Sigma$', title: 'Add math', callback: () => this.addMath()},
                null,
                {icon: 'link', title: 'Add link', callback: () => this.addLink()},
                {icon: 'image', title: 'Add image reference', callback: () => this.addImage()},
                {icon: 'youtube', title: 'Embed YouTube', callback: () => this.addYouTubeLink()}
            ];

            for (const action of actions) {

                const listElement = cE('li');
                list.appendChild(listElement);

                if (action) {

                    const link = cE('a');
                    listElement.appendChild(link);

                    if (action.icon && action.icon.length) {

                        link.setAttribute('uk-icon', `icon: ${action.icon}`);
                    }
                    else if (action.math && action.math.length) {

                        link.innerText = action.math;
                        DOMHelpers.addClasses(link, 'render-math');
                        refreshMath(link);
                    }
                    link.setAttribute('title', action.title);
                    link.setAttribute('uk-tooltip', '');

                    Views.onClick(link, () => { action.callback(); });
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

        private addCode(): void {

            this.addTextAtCurrentPosition('\n' +
                '```\n' +
                'Sample Code\n' +
                '```\n');
        }

        private addMath(): void {

            this.addTextAtCurrentPosition('\n' +
                '$$f(x) = \\sqrt{\\frac{x}{2}}$$\n');
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

        private getFirstMatchOrDefault(input: string, regex: RegExp): string {

            const match = input.match(regex);
            return match && match.length > 1
                ? match[1]
                : '';
        }

        private addYouTubeLink(): void {

            const link = getInput('Please enter the embed code');
            if (link) {

                const src = this.getFirstMatchOrDefault(link, /src="([^"]+)"/i).trim();
                const width = parseInt(this.getFirstMatchOrDefault(link, /width="([^"]+)"/i)) || 0;
                const height = parseInt(this.getFirstMatchOrDefault(link, /height="([^"]+)"/i)) || 0;

                if (src && src.length) {

                    this.addTextAtCurrentPosition(`\n\n![{"width":${width},"height":${height}}](${src})`);
                }
                else {

                    Views.showWarningNotification('Invalid embed code.');
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

            const textArea = this.textArea;
            const before = textArea.value.substr(0, textArea.selectionStart);
            const after = textArea.value.substring(textArea.selectionStart);

            if (0 == textArea.selectionStart) {

                //newlines in value are not needed
                let removeChars = 0;

                for (let i = 0; i < value.length; i++) {

                    if (('\r' == value[i]) || ('\n' == value[i])) {

                        removeChars = i + 1;
                    }
                    else {
                        break;
                    }
                }
                if (removeChars > 0) {

                    value = value.substring(removeChars);
                }
            }

            textArea.value = before + value + after;
        }

        private userNameReferenceRegexValue = '@@([^@\\t\\r\\n]+)@@';

        private matchMultipleUserNames(input: string, callback: (string) => void): void {

            const regex = new RegExp(this.userNameReferenceRegexValue, 'g');
            let match;

            while (null !== (match = regex.exec(input))) {

                callback(match[1]);
            }
        }

        private replaceMultipleUserNames(input: string, callback: (string) => string): string {

            return input.replace(new RegExp(this.userNameReferenceRegexValue, 'g'),
                (substring: string, ...args: any[]) => {

                    return callback(substring.substr(2, substring.length - 4));
                });
        }

        private async replaceUserNameReferences(content: string): Promise<string> {

            const userNameReferences = [];
            this.matchMultipleUserNames(content, name => {

                userNameReferences.push(name);
            });

            if (userNameReferences.length) {

                await UserCache.searchNames(userNameReferences);
            }

            content = this.replaceMultipleUserNames(content, name => {

                const id = UserCache.getIdByName(name);

                return id ? `@${id}@` : `@@${name}@@`;
            });

            return content;
        }
    }
}