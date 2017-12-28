export module DOMHelpers {

    export class DOMAppender {

        private _end: string;
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

    export function escapeStringForContent(value: string): string {

        let element = document.createElement('div');
        element.innerText = value;
        return element.innerHTML;
    }

    export function escapeStringForAttribute(value: string): string {

        let span = document.createElement('span');
        span.setAttribute('a', value);

        let html = span.outerHTML;
        let firstQuote = html.indexOf('"');
        let lastQuote = html.lastIndexOf('"');

        return html.substring(firstQuote + 1, lastQuote);
    }

    export function parseHTML(html: string): HTMLElement {

        let element = document.createElement('template');
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

        let newElement = element.cloneNode(true) as T;
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
}