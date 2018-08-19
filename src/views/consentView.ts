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
            '<div class="uk-cover uk-text-center">' +
            '<h2>This website cannot function without HTTP cookies.</h2>' +
            '<a id="reopen-consent-modal">Reopen Consent Modal</a>' +
            '</div>'
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

        const reopenConsentLink = document.getElementById('reopen-consent-modal');
        Views.onClick(reopenConsentLink, () => { Views.showModal(modal); });
    }
}