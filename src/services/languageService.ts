import * as en from '../languages/en'
import {DOMHelpers} from "../helpers/domHelpers";

export module LanguageService {

    const defaultLanguage: string = 'en';
    let currentLanguage: string = defaultLanguage;

    let languages = {};
    en.load(languages);

    export function setLanguage(language: string) {

        currentLanguage = language;
        translateExistingElements();
    }

    export function translate(text: string, ...args: any[]) {

        const languageEntries = languages[currentLanguage] || languages[defaultLanguage];
        const entry = languageEntries[text] || languages[defaultLanguage][text];

        if (entry) {
            if ('string' == typeof entry) {
                return '____' + entry + '____';
            }
            else {
                return '____' + entry(...args) + '____';
            }
        }
        else {
            return '****' + text + '****';
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
    }
    //TODO, news, consent, create user form, privilege names
}