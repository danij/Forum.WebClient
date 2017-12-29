export module ViewsExtra {

    let remarkable: any;

    declare var Remarkable: any;
    declare var hljs: any;
    declare var MathJax: any;

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

    export function refreshMath(element: HTMLElement): void {

        setTimeout(() => {
            try {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
            }
            catch (ex) {
            }
        }, 100);
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
    }
}