import {Pages} from "../pages/common";
import {Views} from "./common";
import {PathHelpers} from "../helpers/pathHelpers";

export module LoginView {

    export function setupLogin(): void {

        const loginLink = document.getElementById('login-link');
        const loginModal = document.getElementById('login-modal');

        Views.onClick(loginLink, () => Views.showModal(loginModal));

        const loginWithGoogleLink = document.getElementById('login-with-google');
        Views.onClick(loginWithGoogleLink, loginWithGoogle);
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

        self.location.href = Pages.getUrl('auth/google/' + PathHelpers.queryParameters(extra, true));
    }
}