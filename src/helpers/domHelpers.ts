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

            this._values.push(value);
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

        const element = cE('div');
        element.innerText = value;
        return element.innerHTML;
    }

    export function escapeStringForAttribute(value: string): string {

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

    export function hide(element: HTMLElement): void {

        element.classList.add('uk-hidden');
    }

    export function unHide(element: HTMLElement): void {

        element.classList.remove('uk-hidden');
    }

    export function replaceElementWith(element: HTMLElement, replaceWith: HTMLElement): void {

        element.parentNode.replaceChild(replaceWith, element);
    }

    export function addEventListeners(element: HTMLElement, className: string, eventType: string,
                                      handler: (ev: Event) => void): void {

        const elements = element.getElementsByClassName(className);
        for (let i = 0; i < elements.length; ++i) {

            elements[i].addEventListener(eventType, handler);
        }
    }

    export function addEventListenersData(element: HTMLElement, dataName: string, eventType: string,
                                          handler: (ev: Event, value: string) => void): void {

        const attribute = `data-${dataName}`;
        const elements = element.querySelectorAll(`[${attribute}]`);

        for (let i = 0; i < elements.length; ++i) {

            elements[i].addEventListener(eventType, (ev) => {

                handler(ev, elements[i].getAttribute(attribute));
            });
        }
    }
}