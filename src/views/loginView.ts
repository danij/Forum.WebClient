import {Pages} from "../pages/common";
import {Views} from "./common";
import {PathHelpers} from "../helpers/pathHelpers";
import {ConsentRepository} from "../services/consentRepository";
import {ConsentView} from "./consentView";

export module LoginView {

    export function setupLogin(): void {

        const loginLink = document.getElementById('login-link');

        Views.onClick(loginLink, showLoginModal);

        const loginWithGoogleLink = document.getElementById('login-with-google');
        Views.onClick(loginWithGoogleLink, loginWithGoogle);
    }

    function showLoginModal() {

        if (ConsentRepository.alreadyConsentedToUsingCookies()) {

            const loginModal = document.getElementById('login-modal');
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

    function loginWithGoogle():void  {

        const extra = {};

        if (showInOnlineUsers()) {

            extra['show-in-users-online'] = true
        }

        self.location.href = Pages.getUrl('auth/provider/google/' + PathHelpers.queryParameters(extra, true));
    }
}