import {Pages} from "../pages/common";
import {Views} from "./common";
import {PathHelpers} from "../helpers/pathHelpers";
import {ConsentRepository} from "../services/consentRepository";
import {ConsentView} from "./consentView";
import {DOMHelpers} from "../helpers/domHelpers";
import {PageActions} from "../pages/action";
import {AuthenticationView} from "./authenticationView";

export module LoginView {

    import IDocumentationCallback = PageActions.IDocumentationCallback;

    export function setupLogin(docCallback: IDocumentationCallback): void {

        const loginLink = document.getElementById('login-link');

        Views.onClick(loginLink, () => showLoginModal(docCallback));

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

    function showLoginModal(docCallback: IDocumentationCallback) {

        if (ConsentRepository.hasConsentedToUsingCookies()) {

            const loginModal = document.getElementById('login-modal');
            const registerLink = DOMHelpers.removeEventListeners(document.getElementById('register-link'));

            if (AuthenticationView.isRegistrationEnabled()) {

                DOMHelpers.enable(registerLink);
                Views.onClick(registerLink, () => AuthenticationView.showRegisterModal(docCallback));
            }
            else {

                DOMHelpers.disable(registerLink);
            }

            Views.setupKnownDocumentationLinks(loginModal, docCallback);
            Views.showModal(loginModal);
        }
        else {

            ConsentView.showConsentModal((value) => {

                if (value) {

                    setTimeout(() => showLoginModal(docCallback), 500);
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