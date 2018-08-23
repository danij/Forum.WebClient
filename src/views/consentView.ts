import {Views} from "./common";
import {ConsentRepository} from "../services/consentRepository";
import {DOMHelpers} from "../helpers/domHelpers";

export module ConsentView {

    type ConsentCallback = (value: boolean) => void;
    let onConsentCallback: ConsentCallback;

    export function showConsentModal(onConsent?: ConsentCallback): HTMLElement {

        onConsentCallback = onConsent;

        const modal = document.getElementById('consent-modal');

        initConsentModal(modal);

        Views.showModal(modal);

        return modal;
    }

    let consentModalInitialized: boolean = false;

    function rememberCurrentChecked(element: HTMLInputElement): void {

        element.setAttribute('data-was-checked', element.checked.toString());
    }

    function getPreviousChecked(element: HTMLInputElement): boolean {

        return element.getAttribute('data-was-checked') === 'true';
    }

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
        rememberCurrentChecked(cookiesFpConsentCheckbox);

        const saveConsentButton = document.getElementById('save-consent');

        Views.onClick(saveConsentButton, async () => {

            if (getPreviousChecked(cookiesFpConsentCheckbox) == cookiesFpConsentCheckbox.checked) {

                //no change
                if (onConsentCallback) {

                    onConsentCallback(cookiesFpConsentCheckbox.checked);
                    onConsentCallback = null;
                }
                Views.hideOpenModals();
                return;
            }

            rememberCurrentChecked(cookiesFpConsentCheckbox);

            if (cookiesFpConsentCheckbox.checked) {

                await ConsentRepository.consentToUsingCookies();
                Views.hideOpenModals();

                if (onConsentCallback) {

                    onConsentCallback(cookiesFpConsentCheckbox.checked);
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