import {Views} from './common';
import {ConsentRepository} from '../services/consentRepository';
import {DOMHelpers} from '../helpers/domHelpers';

export module ConsentView {

    type ConsentCallback = (value: boolean) => void;
    let onCookieConsentChangeCallback: ConsentCallback;

    export function showConsentModal(onCookieConsentChange?: ConsentCallback): HTMLElement {

        onCookieConsentChangeCallback = onCookieConsentChange;

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
        cookiesFpConsentCheckbox.checked = ConsentRepository.hasConsentedToUsingCookies();
        rememberCurrentChecked(cookiesFpConsentCheckbox);

        const externalContentConsentCheckbox = (document.getElementById('consent-external-content') as HTMLInputElement);
        externalContentConsentCheckbox.checked = ConsentRepository.hasConsentedToLoadingExternalContent();
        rememberCurrentChecked(externalContentConsentCheckbox);

        const saveConsentButton = document.getElementById('save-consent') as HTMLButtonElement;

        Views.onClickWithSpinner(saveConsentButton, async () => {

            await saveFpCookiesConsent(cookiesFpConsentCheckbox);
            //need cookie consent to be able to store other types of consent
            await saveExternalImagesConsent(externalContentConsentCheckbox);

            Views.hideOpenModals();
        });
    }

    async function saveFpCookiesConsent(cookiesFpConsentCheckbox: HTMLInputElement): Promise<void> {

        if (getPreviousChecked(cookiesFpConsentCheckbox) == cookiesFpConsentCheckbox.checked) {

            //no change
            if (onCookieConsentChangeCallback) {

                onCookieConsentChangeCallback(cookiesFpConsentCheckbox.checked);
                onCookieConsentChangeCallback = null;
            }
            return;
        }

        rememberCurrentChecked(cookiesFpConsentCheckbox);

        if (cookiesFpConsentCheckbox.checked) {

            await ConsentRepository.consentToUsingCookies();
            Views.hideOpenModals();

            if (onCookieConsentChangeCallback) {

                onCookieConsentChangeCallback(cookiesFpConsentCheckbox.checked);
                onCookieConsentChangeCallback = null;
            }
        }
        else {

            await ConsentRepository.removeConsentToUsingCookies();
            location.reload();
        }
    }

    async function saveExternalImagesConsent(externalImagesConsentCheckbox: HTMLInputElement): Promise<void> {

        if (getPreviousChecked(externalImagesConsentCheckbox) == externalImagesConsentCheckbox.checked) {

            //no change
            return;
        }

        rememberCurrentChecked(externalImagesConsentCheckbox);

        if (externalImagesConsentCheckbox.checked) {

            await ConsentRepository.consentToLoadingExternalContent();
        }
        else {

            await ConsentRepository.removeConsentToLoadingExternalContent();
        }
        location.reload();
    }

    export function init() {

        const reopenConsentLink = document.getElementById('reopen-consent-modal');

        Views.onClick(reopenConsentLink, () => showConsentModal());
    }
}