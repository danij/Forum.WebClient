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

        return $('<div></div>').text(value).html();
    }

    export function escapeStringForAttribute(value: string): string {

        let span = document.createElement('span');
        span.setAttribute('a', value);

        let html = span.outerHTML;
        let firstQuote = html.indexOf('"');
        let lastQuote = html.lastIndexOf('"');

        let result = html.substring(firstQuote + 1, lastQuote);
        return result;
    }

    export function parseHTML(html: string): HTMLElement {

        let element = document.createElement('template');
        element.innerHTML = html;
        return element.content.firstChild as HTMLElement;
    }
}