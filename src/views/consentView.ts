import {Views} from "./common";
import {ConsentRepository} from "../services/consentRepository";
import {DOMHelpers} from "../helpers/domHelpers";

export module ConsentView {

    let onConsentCallback: () => void;

    export function showConsentModal(onConsent?: () => void): HTMLElement {

        onConsentCallback = onConsent;

        const modal = document.getElementById('consent-modal');

        initConsentModal(modal);

        Views.showModal(modal);

        return modal;
    }

    let consentModalInitialized: boolean = false;

    function initConsentModal(modal: HTMLElement): void {

        if (consentModalInitialized) return;
        consentModalInitialized = true;

        const links = modal.getElementsByTagName('a');

        DOMHelpers.forEach<HTMLAnchorElement>(links, link => {

            link.setAttribute('target', '_blank');
            DOMHelpers.addRelAttribute(link);
        });

        const cookiesFpConsentCheckbox = (document.getElementById('consent-fp-cookies') as HTMLInputElement);
        cookiesFpConsentCheckbox.checked = ConsentRepository.alreadyConsentedToUsingCookies();

        const saveConsentButton = document.getElementById('save-consent');

        Views.onClick(saveConsentButton, async () => {

            if (cookiesFpConsentCheckbox.checked) {

                await ConsentRepository.consentToUsingCookies();
                Views.hideOpenModals();

                if (onConsentCallback) {

                    onConsentCallback();
                    onConsentCallback = null;
                }
            }
            else {

                await ConsentRepository.removeConsentToUsingCookies();
                location.reload();
            }
        });
    }

    export function init() {

        const reopenConsentLink = document.getElementById('reopen-consent-modal');

        Views.onClick(reopenConsentLink, () => showConsentModal());
    }
}