export module ViewsExtra {

    let remarkable: any;

    declare var Remarkable: any;
    declare var hljs: any;

    export function init() {

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

        return remarkable.render(content);
    }
}