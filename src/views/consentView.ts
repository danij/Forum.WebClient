import {Views} from "./common";
import {ConsentRepository} from "../services/consentRepository";
import {DOMHelpers} from "../helpers/domHelpers";

export module ConsentView {

    export function showConsentModal(): HTMLElement {

        const modal = document.getElementById('consent-modal');

        initConsentModal(modal);

        Views.showModal(modal);

        return modal;
    }

    function initConsentModal(modal: HTMLElement): void {

        const links = modal.getElementsByTagName('a');

        DOMHelpers.forEach<HTMLAnchorElement>(links, link => {

            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'nofollow noopener noreferrer');
        });

        document.getElementById('page-content-container').appendChild(DOMHelpers.parseHTML(
            '<h2 class="uk-cover">This website cannot function without HTTP cookies.</h2>'
        ));
        document.getElementsByClassName('page-footer')[0].classList.add('uk-hidden');

        const saveConsentButton = document.getElementById('save-consent');

        Views.onClick(saveConsentButton, () => {

            const cookiesConsent = (document.getElementById('consent-cookies') as HTMLInputElement).checked;

            if (cookiesConsent) {

                document.getElementsByClassName('page-footer')[0].classList.remove('uk-hidden');
                ConsentRepository.consentToUsingCookies();
            }

            Views.hideOpenModals();
        });
    }
}