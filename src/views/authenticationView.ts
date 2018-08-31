import {PageActions} from '../pages/action';
import {DOMHelpers} from '../helpers/domHelpers';
import {Views} from './common';
import {ThreadsPage} from '../pages/threadsPage';
import {ConsentRepository} from '../services/consentRepository';
import {ConsentView} from './consentView';
import {DocumentationView} from './documentationView';

export module AuthenticationView {

    import IUserCallback = PageActions.IUserCallback;
    import IDocumentationCallback = PageActions.IDocumentationCallback;

    interface RegisterConfig {

        enableRegistration: boolean,
        minAge: number
    }

    declare const registerConfig: RegisterConfig;

    export function isRegistrationEnabled(): boolean {

        return registerConfig.enableRegistration;
    }

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

    export function showRegisterModal(docCallback: IDocumentationCallback): void {

        if ( ! isRegistrationEnabled()) {

            Views.showWarningNotification('Registration is not available.');
            return;
        }

        if (ConsentRepository.hasConsentedToUsingCookies()) {

            const registerModal = document.getElementById('register-modal');

            prepareAuthentication(docCallback);

            Views.showModal(registerModal);
        }
        else {

            ConsentView.showConsentModal((value) => {

                if (value) {

                    setTimeout(() => showRegisterModal(docCallback), 500);
                }
                else {

                    Views.showWarningNotification('Consent for storing cookies is required to be able to register.');
                }
            });
        }
    }

    async function prepareAuthentication(docCallback: IDocumentationCallback): Promise<void> {

        const registerPrivacyPolicyContainer = document.getElementById('register-policy');
        const registerToSContainer = document.getElementById('register-tos');
        const registerConfirmAgeCheckbox = document.getElementById('register-confirm-min-age');
        const registerConfirmAgeGroup = registerConfirmAgeCheckbox.parentElement;
        const registerConfirmAgeLabel = registerConfirmAgeGroup.getElementsByTagName('label')[0] as HTMLElement;
        const registerButtonContainer = document.getElementById('register-button').parentElement;

        DOMHelpers.hide(registerButtonContainer);

        registerPrivacyPolicyContainer.innerHTML = '';
        registerPrivacyPolicyContainer.appendChild(
            await DocumentationView.createDocumentationContainer(Views.DisplayConfig.privacyPolicyDocName, docCallback));

        registerToSContainer.innerHTML = '';
        registerToSContainer.appendChild(
            await DocumentationView.createDocumentationContainer(Views.DisplayConfig.termsOfServiceDocName, docCallback));

        if (registerConfig.minAge > 0) {

            registerConfirmAgeLabel.innerText =registerConfirmAgeLabel.innerText.replace('{age}',
                registerConfig.minAge.toString());
            DOMHelpers.unHide(registerConfirmAgeGroup);
        }
        else {

            DOMHelpers.hide(registerConfirmAgeGroup);
        }

        DOMHelpers.unHide(registerButtonContainer);
    }
}