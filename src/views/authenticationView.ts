import {PageActions} from "../pages/action";
import {DOMHelpers} from "../helpers/domHelpers";
import {Views} from "./common";
import {ThreadsPage} from "../pages/threadsPage";
import {Pages} from "../pages/common";

export module AuthenticationView {

    import IUserCallback = PageActions.IUserCallback;

    export function checkAuthentication(authCallback: PageActions.IAuthCallback,
                                        userCallback: PageActions.IUserCallback): void {

        authCallback.getCurrentUser().then(currentUser => {

            if (null == currentUser) return;

            if (currentUser.authenticated) {

                DOMHelpers.hide(document.getElementById('login-link'));
                DOMHelpers.unHide(document.getElementById('logged-in-link'));
            }
            else {

                return;
            }

            if (currentUser.user) {

                const myUserLink = document.getElementById('my-user-link');
                DOMHelpers.unHide(myUserLink);
                myUserLink.innerText = currentUser.user.name;

                Views.onClick(myUserLink, () => {

                    new ThreadsPage().displayForLoadedUser(currentUser.user);
                });
            }
            else {

                const createUserLink = document.getElementById('create-user-name-link');
                DOMHelpers.unHide(createUserLink);
                Views.onClick(createUserLink, showCreateUserModal);

                showCreateUserModal(userCallback);
            }

            if (authCallback.usingCustomAuthentication()) {

                DOMHelpers.unHide(document.getElementById('change-password-link'));
            }

            Views.onClick(document.getElementById('logout-link'), () => { authCallback.logout(); });
        })
    }

    function showCreateUserModal(userCallback: IUserCallback) {

        const modal = document.getElementById('create-user-name-modal');
        const createButton = DOMHelpers.removeEventListeners(document.getElementById('create-user-name-button'));

        const toReplace = {

            userNameMinLength: Views.DisplayConfig.newUserLengths.minName,
            userNameMaxLength: Views.DisplayConfig.newUserLengths.maxName,
        };

        DOMHelpers.forEach(modal.getElementsByClassName('replace-template'), element => {

            for (let key of Object.getOwnPropertyNames(toReplace)) {

                element.innerText = element.innerText.replace(`{${key}}`, toReplace[key]);
            }
        });

        Views.onClick(createButton, async () => {

            const name = (document.getElementById('user-name-input') as HTMLInputElement).value;

            if (await userCallback.createUser(name)) {

                location.reload();
            }
        });

        Views.showModal(modal);
    }
}