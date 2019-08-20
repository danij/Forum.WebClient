import * as en from '../languages/en'
import {DOMHelpers} from "../helpers/domHelpers";

export module LanguageService {

    import cE = DOMHelpers.cE;

    const defaultLanguage: string = 'en';
    let currentLanguage: string = defaultLanguage;

    let languages = {};
    let languageEntries = [];
    en.load(languages, languageEntries);

    setTimeout(populateLanguageEntries, 0);

    function populateLanguageEntries(): void {

        const select = document.getElementById('language-select');
        for (const languageEntry of languageEntries) {

            const element = cE('option');
            select.appendChild(element);
            element.setAttribute('value', languageEntry['id']);
            if (languageEntry['id'] == getCurrentLanguage()) {
                element.setAttribute('selected', '');
            }
            element.innerText = languageEntry['name'];
        }
    }

    export function setLanguage(language: string) {

        currentLanguage = language;
        translateExistingElements();
    }

    export function getCurrentLanguage(): string {

        return currentLanguage;
    }

    export function translate(text: string, ...args: any[]) {

        const languageEntries = languages[currentLanguage] || languages[defaultLanguage];
        const entry = languageEntries[text] || languages[defaultLanguage][text];

        if (entry) {
            if ('string' == typeof entry) {
                return entry;
            } else {
                return entry(...args);
            }
        } else {
            console.log('Could not find translation for:', text);
            return text;
        }
    }

    function translateExistingElements() {

        DOMHelpers.forEach(document.querySelectorAll('[translate]'), element => {

            for (let i = 0; i < element.childNodes.length; ++i) {
                const node = element.childNodes[i];
                if (node.nodeType != 3) continue;

                node.textContent = node.textContent.replace(/(\s*)(.*[^\s]+)(\s*)/, (_, before, value, after) => {

                    return `${before}${translate(value)}${after}`;
                });
            }
            for (let attr of ['placeholder', 'title']) {
                const value = element.getAttribute(attr);
                if (value) {
                    element.setAttribute(attr, translate(value));
                }
            }
        });
        DOMHelpers.forEach(document.querySelectorAll('[translate-html]'), element => {

            element.innerHTML = translate(element.innerText);
        });
    }
}