import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {ConsentRepository} from '../services/consentRepository';
import * as hljs from 'highlight.js/lib/index.js';
import 'highlight.js/styles/default.css';

export module ViewsExtra {

    import cE = DOMHelpers.cE;

    let remarkable: any;

    declare var Remarkable: any;
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
            remarkable.renderer.rules.image = (tokens, index) => {

                //set the src of the image as data- so as not to load it until further processed
                const token = tokens[index];

                const src = DOMHelpers.escapeStringForAttribute(token.src || "");
                const title = DOMHelpers.escapeStringForAttribute(token.title || "");
                const alt = DOMHelpers.escapeStringForAttribute(token.alt || "");

                return `<img data-src="${src}" title="${title}" alt="${alt}" />`;
            };
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

            const elements = DOMHelpers.toArray(element.getElementsByClassName('render-math'));
            if (element.classList.contains('render-math')) {

                elements.push(element);
            }
            for (let currentElement of elements) {

                try {

                    renderMathInElement(currentElement, katexRenderOptions);
                }
                catch (ex) {

                    console.log(ex);
                }
            }
        }, 10);
    }

    export function adjustMessageContent(container: HTMLElement): void {

        const contentElements = container.querySelectorAll('.message-content');

        DOMHelpers.forEach(contentElements, element => {

            const tables = element.querySelectorAll('table');
            for (let ti = 0; ti < tables.length; ++ti) {

                const table = tables[ti];
                DOMHelpers.addClasses(table, 'uk-table', 'uk-table-small', 'uk-table-striped');
            }
        });

        const links = container.getElementsByTagName('a');
        DOMHelpers.forEach(links, link => {

            DOMHelpers.addRelAttribute(link as HTMLAnchorElement);
        });

        const imgs = container.getElementsByTagName('img');
        DOMHelpers.forEach(imgs, img => {

            adjustImageInMessage(img as HTMLImageElement);
        });
    }

    function adjustImageInMessage(imageElement: HTMLImageElement): void {

        const src = imageElement.getAttribute('data-src');

        if (isYouTubeLink(src)) {

            DOMHelpers.replaceElementWith(imageElement, createYouTubeElement(imageElement, src));
            return;
        }

        if (Pages.isLocalUrl(src)) {

            return;
        }

        if (ConsentRepository.hasConsentedToLoadingExternalImages()) {

            loadImage(imageElement, src);
        }
        else {

            DOMHelpers.replaceElementWith(imageElement, createImageLink(imageElement, src));
        }
    }

    function loadImage(element: HTMLImageElement, src: string): void {

        element.src = src;
    }

    function createImageLink(imageElement: HTMLImageElement, src: string): HTMLElement {

        const linkTitle = Pages.getConfig().externalImagesWarningFormat
            .replace(/{title}/g, imageElement.alt || src);

        const link = cE('a') as HTMLAnchorElement;
        link.href = src;
        link.innerText = linkTitle;
        link.setAttribute('target', '_blank');
        DOMHelpers.addRelAttribute(link);

        return link;
    }

    function isYouTubeLink(src: string): boolean {

        return src.startsWith('https://www.youtube.com/');
    }

    function createYouTubeElement(imageElement: HTMLImageElement, src: string): HTMLElement {

        if (ConsentRepository.hasConsentedToLoadingExternalImages()) {

            let extra;
            try {

                extra = JSON.parse(imageElement.alt);
            }
            catch {

                extra = {};
            }

            const aspectRatio = extra.width && extra.height
                ? extra.width / extra.height
                : 16/9;

            const iFrame = cE('iframe');
            DOMHelpers.addClasses(iFrame, 'embedded-video');

            iFrame.setAttribute('src', src);
            iFrame.setAttribute('frameborder', '0');
            iFrame.setAttribute('allow', 'autoplay; encrypted-media');
            //iFrame.setAttribute('allowfullscreen', '');

            setTimeout(() => {

                const iFrameAvailableWidth = iFrame.parentElement.clientWidth - 10;

                iFrame.setAttribute('width', `${iFrameAvailableWidth}px`);
                iFrame.setAttribute('height', `${iFrameAvailableWidth / aspectRatio}px`);

            }, 1000);

            return iFrame;
        }
        else {

            imageElement.alt = imageElement.src;

            return createImageLink(imageElement, src);
        }
    }

    export function expandAndAdjust(container: HTMLElement, source?: string): void {

        container.innerHTML = expandContent(source || container.innerText);
        adjustMessageContent(container);
    }
}