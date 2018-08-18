import {DOMHelpers} from "../helpers/domHelpers";

export module ViewsExtra {

    let remarkable: any;

    declare var Remarkable: any;
    declare var hljs: any;
    declare var renderMathInElement: (element: HTMLElement, options: any) => void;

    export function init() {

        try {
            remarkable = new Remarkable({

                html: false,
                xhtmlOut: true,
                linkify: true,
                linkTarget: '_blank',
                typographer: true,
                quotes: '“”‘’',
                highlight: highlightCode
            });
        }
        catch (ex) {
        }
    }

    function highlightCode(value: string, language: string): string {

        try {
            if (language && language.length) {

                return hljs.highlight(language, value).value;
            }
            else {

                return hljs.highlightAuto(value).value;
            }
        }
        catch (ex) {

            return '';
        }
    }

    export function expandContent(content: string): string {

        try {
            return remarkable.render(content);
        }
        catch (ex) {

            console.log(ex);
            return '<span class="uk-label uk-label-danger">Error while rendering</span>';
        }
    }

    const katexRenderOptions = {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\[", right: "\\]", display: true},
            {left: "\\(", right: "\\)", display: false}
        ]
    };

    export function refreshMath(element: HTMLElement): void {

        setTimeout(() => {

            const elements = document.getElementsByClassName('render-math');
            DOMHelpers.forEach(elements, element => {

                try {

                    renderMathInElement(element, katexRenderOptions);
                }
                catch (ex) {

                    console.log(ex);
                }
            });
        }, 10);
    }

    export function adjustMessageContent(container: HTMLElement): void {

        const contentElements = container.querySelectorAll('.message-content');

        DOMHelpers.forEach(contentElements, element => {

            const tables = element.querySelectorAll('table');
            for (let ti = 0; ti < tables.length; ++ti) {

                const table = tables[ti];
                table.classList.add('uk-table', 'uk-table-small', 'uk-table-striped');
            }
        });

        const links = container.getElementsByTagName('a');
        DOMHelpers.forEach(links, link => {

            link.setAttribute('rel', 'nofollow noopener noreferrer');
        });
    }

    export function expandAndAdjust(container: HTMLElement): void {

        container.innerHTML = expandContent(container.innerText);
        adjustMessageContent(container);
    }
}