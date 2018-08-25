import {Pages} from "../pages/common";
import {Views} from "./common";
import {PathHelpers} from "../helpers/pathHelpers";
import {ConsentRepository} from "../services/consentRepository";
import {ConsentView} from "./consentView";
import {DOMHelpers} from "../helpers/domHelpers";

export module LoginView {

    export function setupLogin(): void {

        const loginLink = document.getElementById('login-link');

        Views.onClick(loginLink, showLoginModal);

        const loginWithGoogleLink = document.getElementById('login-with-google');
        Views.onClick(loginWithGoogleLink, loginWithGoogle);

        setupEnabledAuthProviders(Pages.getAllowedAuthProviders());
    }

    function setupEnabledAuthProviders(providers: string[]): void {

        let allowCustomProviders: boolean = false;

        for (let provider of providers) {

            DOMHelpers.unHide(document.getElementById(`login-container-${provider}`));
            if ('custom' != provider) {

                allowCustomProviders = true;
            }
        }
        if (allowCustomProviders) {

            DOMHelpers.unHide(document.getElementById('login-different-providers'));
        }
    }

    function showLoginModal() {

        if (ConsentRepository.hasConsentedToUsingCookies()) {

            const loginModal = document.getElementById('login-modal');
            Views.setupKnownDocumentationLinks(loginModal);
            Views.showModal(loginModal);
        }
        else {

            ConsentView.showConsentModal((value) => {

                if (value) {

                    setTimeout(() => showLoginModal(), 500);
                }
                else {

                    Views.showWarningNotification('Consent for storing cookies is required to be able to log in.');
                }
            });
        }
    }

    function showInOnlineUsers() : boolean {

        const checkBox = document.getElementById('show-in-online-users') as HTMLInputElement;
        return checkBox.checked;
    }

    function checkAgreePrivacyToS(): boolean {

        const checkBox = document.getElementById('accept-privacy-and-tos') as HTMLInputElement;

        if ( ! checkBox.checked) {

            Views.showWarningNotification('Cannot log in without accepting the privacy policy and terms of service');
        }

        return checkBox.checked;
    }

    function loginWithGoogle():void  {

        if ( ! checkAgreePrivacyToS()) return;

        const extra = {

            'accepted-privacy-policy-and-tos': true
        };

        if (showInOnlineUsers()) {

            extra['show-in-users-online'] = true
        }

        self.location.href = Pages.getUrl('auth/provider/google/' + PathHelpers.queryParameters(extra, true));
    }
}