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
            return $(html)[0];
        }
    }

    export function escapeStringForContent(value: string): string {

        return $('<div></div>').text(value).html();
    }
}