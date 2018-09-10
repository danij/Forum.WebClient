import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {ConsentRepository} from '../services/consentRepository';
import {DisplayHelpers} from "../helpers/displayHelpers";
import {UserCache} from "../services/userCache";
import {UsersView} from "./usersView";
import {Views} from "./common";
import * as emojiRegexProvider from 'emoji-regex';
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
            return wrapEmojis(replaceUserIdReferences(remarkable.render(content)));
        }
        catch (ex) {

            console.log(ex);
            return '<span class="uk-label uk-label-danger">Error while rendering</span>';
        }
    }

    const emojiFind = emojiRegexProvider();

    export function wrapEmojis(content: string): string {

        return content.replace(emojiFind, function (substring: string, ...args: any[]) {

            return `<span class="e">${substring}</span>`;
        });
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

        const blockQuotes = container.getElementsByTagName('blockquote');
        DOMHelpers.forEach(blockQuotes, adjustBlockquote);

        const links = container.getElementsByTagName('a');
        DOMHelpers.forEach(links, link => {

            DOMHelpers.addRelAttribute(link as HTMLAnchorElement);
        });

        const imgs = container.getElementsByTagName('img');
        DOMHelpers.forEach(imgs, img => {

            adjustImageInMessage(img as HTMLImageElement);
        });

        Views.setupThreadsOfUsersLinks(container);
    }

    function adjustImageInMessage(imageElement: HTMLImageElement): void {

        const src = imageElement.getAttribute('data-src') || imageElement.src || '';

        if (isYouTubeLink(src)) {

            createYouTubeElement(imageElement, src);
            return;
        }

        if (Pages.isLocalUrl(src)) {

            return;
        }

        if (ConsentRepository.hasConsentedToLoadingExternalContent()) {

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
            .replace(/{title}/, imageElement.alt || src);

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

    function createYouTubeElement(imageElement: HTMLImageElement, src: string): void {

        if (ConsentRepository.hasConsentedToLoadingExternalContent()) {

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

            const newParent = cE('div');
            newParent.style.position = 'relative';
            newParent.style.height = '0';
            newParent.style.paddingTop = `${1.0/aspectRatio * 100}%`;

            const iFrame = cE('iframe');
            newParent.appendChild(iFrame);
            DOMHelpers.addClasses(iFrame, 'embedded-video');

            iFrame.setAttribute('src', src);
            iFrame.setAttribute('frameborder', '0');
            iFrame.setAttribute('allow', 'autoplay; encrypted-media');
            //iFrame.setAttribute('allowfullscreen', '');

            DOMHelpers.replaceElementWith(imageElement.parentElement, newParent);
        }
        else {

            const normalUrl = convertToNormalUrl(src);
            imageElement.alt = normalUrl;

            DOMHelpers.replaceElementWith(imageElement, createImageLink(imageElement, normalUrl));
        }
    }

    function convertToNormalUrl(embeddedUrl: string): string {

        const split = embeddedUrl.split('/');
        const id = split[split.length - 1];

        return `https://www.youtube.com/watch?v=${id}`;
    }

    function adjustBlockquote(quote: HTMLElement): void {

        if (quote.children.length > 0) {

            const firstParagraph = quote.children[0] as HTMLElement;
            if ('P' == firstParagraph.tagName.toUpperCase()) {

                const match = firstParagraph.innerHTML.match(/^quote\|(\d+)\|(.+)$/i);
                if (match && match.length > 0) {

                    const createdAt = parseInt(match[1]);
                    const userName = match[2];

                    const replacement = cE('p');
                    DOMHelpers.addClasses(replacement, 'quote-title');
                    DOMHelpers.addClasses(firstParagraph.parentElement, 'no-border-top');

                    replacement.innerHTML = `${userName} @ ${DisplayHelpers.getDateTime(createdAt)}`;

                    DOMHelpers.replaceElementWith(firstParagraph, replacement);
                }
            }
        }
    }

    export function expandAndAdjust(container: HTMLElement, source?: string): void {

        container.innerHTML = expandContent(source || container.innerText);
        adjustMessageContent(container);
    }

    const userIdReferenceRegexValue = "\\@([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\\@";

    function matchMultipleUserIds(input: string, callback: (string) => void): void {

        const regex = new RegExp(userIdReferenceRegexValue, 'gi');
        let match;

        while (null !== (match = regex.exec(input))) {

            callback(match[1]);
        }
    }

    export async function searchUsersById(inputs: string[]): Promise<void> {

        const ids = [];

        for (const input of inputs) {

            matchMultipleUserIds(input, id => {

                ids.push(id.toLowerCase());
            });
        }
        await UserCache.searchUsersById(ids);
    }

    function replaceUserIdReferences(content: string): string {

        const regex = new RegExp(userIdReferenceRegexValue, 'gi');
        return content.replace(regex, (substring: string, ...args: any[]) => {

            const user = UserCache.getUserById(substring.substr(1, substring.length - 2));
            return user ? UsersView.createUserReferenceInMessage(user) : substring ;
        });
    }
}