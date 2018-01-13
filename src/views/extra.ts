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

            return 'Error while rendering';
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
            try {
                renderMathInElement(element, katexRenderOptions);
            }
            catch (ex) {
            }
        }, 10);
    }

    export function adjustMessageContent(container: HTMLElement): void {

        let contentElements = container.querySelectorAll('.message-content');

        for (let i = 0; i < contentElements.length; ++i) {

            let element = contentElements[i];

            let tables = element.querySelectorAll('table');
            for (let ti = 0; ti < tables.length; ++ti) {

                let table = tables[ti];
                table.classList.add('uk-table', 'uk-table-small', 'uk-table-striped');
            }
        }

        let links = container.getElementsByTagName('a');
        for (let i = 0; i < links.length; ++i) {

            let link = links[i];
            link.setAttribute('rel', 'nofollow');
        }
    }

    export function expandAndAdjust(container: HTMLElement): void {

        container.innerHTML = expandContent(container.innerText);
        adjustMessageContent(container);
    }
}