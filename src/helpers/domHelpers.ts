export module DOMHelpers {

    export class DOMAppender {

        private readonly _end: string;
        private _values: any;

        public constructor(start: string, end: string) {

            this._values = [start];
            this._end = end;
        }

        public appendString(value: string) {

            this._values.push(escapeStringForContent(value));
        }

        public appendRaw(value: string) {

            this._values.push(value);
        }

        public append(value: DOMAppender) {

            if (value) {

                this._values.push(value);
            }
        }

        public appendElement(value: HTMLElement) {

            this._values.push(value.outerHTML);
        }

        public toString(): string {

            return this._values.join('')
                + this._end;
        }

        public toElement(): HTMLElement {

            const html = this.toString();
            return parseHTML(html);
        }
    }

    export function dA(start: string): DOMAppender {

        start = (start || '').trim();

        if (0 == start.length) return null;

        if ('<' != start[0]) {

            return new DOMAppender(`<${start}>`, `</${start}>`);
        }
        if (start.endsWith('/>')) {

            return new DOMAppender(start, '');
        }

        const elementName = start.match(/<[^a-zA-Z]*([a-zA-Z]+)[^a-zA-Z]+/)[1];

        return new DOMAppender(start, `</${elementName}>`);
    }

    export function cE(tagName: string) : HTMLElement {

        return document.createElement(tagName);
    }

    export function escapeStringForContent(value: string): string {

        if (value.length < 1) { return value; }

        const element = cE('div');
        element.innerText = value;
        return element.innerHTML;
    }

    export function escapeStringForAttribute(value: string): string {

        if (value.length < 1) { return value; }

        const span = cE('span');
        span.setAttribute('a', value);

        const html = span.outerHTML;
        const firstQuote = html.indexOf('"');
        const lastQuote = html.lastIndexOf('"');

        return html.substring(firstQuote + 1, lastQuote).replace(/\n/g, '&#013;');
    }

    export function parseHTML(html: string): HTMLElement {

        const element = cE('template') as HTMLTemplateElement;
        element.innerHTML = html;
        return element.content.firstChild as HTMLElement;
    }

    export function concatAttributes(values: object): string {

        return Object.keys(values).map(key => {

            return `${key}="${escapeStringForAttribute(values[key])}"`;

        }).join(' ');
    }

    export function getLink(ev: Event): HTMLAnchorElement {

        let element = ev.target as HTMLElement;
        while ('a' != element.tagName.toLowerCase()) {
            element = element.parentElement;
        }
        return element as HTMLAnchorElement;
    }

    export function removeEventListeners<T extends HTMLElement>(element: T): T {

        if (null == element.parentNode) {
            return element;
        }
        const newElement = element.cloneNode(true) as T;
        element.parentNode.replaceChild(newElement, element);

        return newElement;
    }

    export function disable(element: HTMLElement): void {

        DOMHelpers.addClasses(element, 'uk-disabled');
        if (element.tagName.toLowerCase() === 'a') {

            DOMHelpers.addClasses(element, 'uk-link-muted');
        }
    }

    export function enable(element: HTMLElement): void {

        DOMHelpers.removeClasses(element, 'uk-disabled', 'uk-link-muted');
    }

    export function hide(element: HTMLElement): void {

        DOMHelpers.addClasses(element, 'uk-hidden');
    }

    export function unHide(element: HTMLElement): void {

        DOMHelpers.removeClasses(element, 'uk-hidden');
    }

    export function replaceElementWith(element: HTMLElement, replaceWith: HTMLElement): void {

        element.parentNode.replaceChild(replaceWith, element);
    }

    export function addEventListeners(element: HTMLElement, className: string, eventType: string,
                                      handler: (ev: Event) => void): void {

        const elements = element.getElementsByClassName(className);
        DOMHelpers.forEach(elements, element => {

            element.addEventListener(eventType, ev => {

                ev.preventDefault();
                handler(ev);
            });
        });
    }

    export function addEventListenersIncludingSelf(element: HTMLElement, className: string, eventType: string,
                                                   handler: (ev: Event) => void): void {

        if (element.classList.contains(className)) {

            element.addEventListener(eventType, ev => {

                ev.preventDefault();
                handler(ev);
            });
        }
        else {

            addEventListeners(element, className, eventType, handler);
        }
    }

    export function addEventListenersData(element: HTMLElement, dataName: string, eventType: string,
                                          handler: (ev: Event, value: string) => void): void {

        const attribute = `data-${dataName}`;
        const elements = element.querySelectorAll(`[${attribute}]`);

        DOMHelpers.forEach(elements, element => {

            element.addEventListener(eventType, (ev) => {

                handler(ev, element.getAttribute(attribute));
            });
        });
    }

    export function wrapIfMultiple(...appenders: DOMAppender[]) : DOMAppender {

        const nonEmptyAppenders = appenders.filter(a => a);

        if (0 == nonEmptyAppenders.length) {

            return null;
        }
        else if (1 == nonEmptyAppenders.length) {

            return nonEmptyAppenders[0];
        }
        else {

            const result = dA('div');

            for (let nonEmptyAppender of nonEmptyAppenders) {

                result.append(nonEmptyAppender);
            }

            return result;
        }
    }

    export function goUpUntilTag(element: HTMLElement, tagName: string): HTMLElement {

        tagName = tagName.toLowerCase();

        return goUpUntil(element, currentElement => currentElement.tagName.toLowerCase() == tagName);
    }

    export function goUpUntil(element: HTMLElement, match: (HTMLElement) => boolean): HTMLElement {

        while ( ! match(element) && element.parentElement) {

            element = element.parentElement;
        }

        return match(element) ? element : null;
    }

    export function switchHidden(elements: HTMLElement[]): void {

        const className = 'uk-hidden';

        for (const element of elements) {

            if (element.classList.contains(className)) {

                DOMHelpers.removeClasses(element, className);
            }
            else {
                DOMHelpers.addClasses(element, className);
            }
        }
    }

    export function forEach<T extends HTMLElement = HTMLElement>(collection: any,
                                                                 callback: (element: T) => void): void {

        //make a copy of the collection as it might mutate while iterating
        toArray(collection).forEach(callback);
    }

    export function toArray<T extends HTMLElement = HTMLElement>(collection: any): T[] {

        const result: T[] = [];

        for (let i = 0; i < collection.length; ++i) {

            result.push(collection[i] as T);
        }
        return result;
    }

    export function addRelAttribute(link: HTMLAnchorElement): void {

        link.setAttribute('rel', 'nofollow noopener noreferrer');
    }

    export function addClasses(element: HTMLElement, ...classes: string[]): void {

        for (let value of classes) {

            element.classList.add(value);
        }
    }

    export function removeClasses(element: HTMLElement, ...classes: string[]): void {

        for (let value of classes) {

            element.classList.remove(value);
        }
    }
}