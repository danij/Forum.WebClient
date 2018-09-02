import {PageActions} from '../pages/action';
import {DOMHelpers} from '../helpers/domHelpers';
import {Views} from './common';
import {ThreadsPage} from '../pages/threadsPage';
import {ConsentRepository} from '../services/consentRepository';
import {ConsentView} from './consentView';
import {DocumentationView} from './documentationView';

export module AuthenticationView {

    interface RegisterConfig {

        enableRegistration: boolean,
        minAge: number,
        minPasswordLength: number
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

            Views.onClick(document.getElementById('logout-link'), () => {
                authCallback.logout();
            });
        })
    }

    function showCreateUserModal(userCallback: PageActions.IUserCallback) {

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

    export function showRegisterModal(authCallback: PageActions.IAuthCallback,
                                      docCallback: PageActions.IDocumentationCallback): void {

        if (!isRegistrationEnabled()) {

            Views.showWarningNotification('Registration is not available.');
            return;
        }

        if (ConsentRepository.hasConsentedToUsingCookies()) {

            const registerModal = document.getElementById('register-modal');

            prepareRegistration(authCallback, docCallback);

            Views.showModal(registerModal);
        }
        else {

            ConsentView.showConsentModal((value) => {

                if (value) {

                    setTimeout(() => showRegisterModal(authCallback, docCallback), 500);
                }
                else {

                    Views.showWarningNotification('Consent for storing cookies is required to be able to register.');
                }
            });
        }
    }

    async function prepareRegistration(authCallback: PageActions.IAuthCallback,
                                       docCallback: PageActions.IDocumentationCallback): Promise<void> {

        const registerPrivacyPolicyContainer = document.getElementById('register-policy');
        const registerToSContainer = document.getElementById('register-tos');
        const registerConfirmAgeCheckbox = document.getElementById('register-confirm-min-age');
        const registerConfirmAgeGroup = registerConfirmAgeCheckbox.parentElement;
        const registerConfirmAgeLabel = registerConfirmAgeGroup.getElementsByTagName('label')[0] as HTMLElement;
        const registerButton = document.getElementById('register-button') as HTMLButtonElement;
        const registerButtonContainer = registerButton.parentElement;

        DOMHelpers.hide(registerButtonContainer);

        registerPrivacyPolicyContainer.innerHTML = '';
        registerPrivacyPolicyContainer.appendChild(
            await DocumentationView.createDocumentationContainer(Views.DisplayConfig.privacyPolicyDocName, docCallback));

        registerToSContainer.innerHTML = '';
        registerToSContainer.appendChild(
            await DocumentationView.createDocumentationContainer(Views.DisplayConfig.termsOfServiceDocName, docCallback));

        if (registerConfig.minAge > 0) {

            registerConfirmAgeLabel.innerText = registerConfirmAgeLabel.innerText.replace('{age}',
                registerConfig.minAge.toString());
            DOMHelpers.unHide(registerConfirmAgeGroup);
        }
        else {

            DOMHelpers.hide(registerConfirmAgeGroup);
        }

        DOMHelpers.unHide(registerButtonContainer);

        Views.onClickWithSpinner(DOMHelpers.removeEventListeners(registerButton), () => register(authCallback));
    }

    async function register(callback: PageActions.IAuthCallback): Promise<void> {

        const emailInput = document.getElementById('register-email') as HTMLInputElement;
        const email = emailInput.value;
        const passwordInput = document.getElementById('register-password') as HTMLInputElement;
        const password = passwordInput.value;
        const confirmPasswordInput = document.getElementById('register-password-confirm') as HTMLInputElement;
        const confirmPassword = confirmPasswordInput.value;
        const acceptPrivacyTosCheckbox = document.getElementById('register-accept-privacy-and-tos') as HTMLInputElement;
        const registerConfirmAgeCheckbox = document.getElementById('register-confirm-min-age') as HTMLInputElement;

        let acceptPrivacy: boolean = false;
        let acceptTos: boolean = false;
        let minAge: number = 0;

        {
            if (! validateEmail(email)) {

                Views.showWarningNotification('Invalid email address!');
                return;
            }
        }
        {
            if (! validatePassword(password)) {

                Views.showWarningNotification('Please use a more complex password!');
                return;
            }
            if (password != confirmPassword) {

                Views.showWarningNotification('Passwords do not match!');
                return;
            }
        }
        {
            if (acceptPrivacyTosCheckbox.checked) {

                acceptPrivacy = true;
                acceptTos = true;
            }
            else {

                Views.showWarningNotification('Cannot register if the Privacy Policy and Terms of Service are not accepted');
                return;
            }
        }
        {
            if (registerConfig.minAge > 0) {

                if (registerConfirmAgeCheckbox.checked) {

                    minAge = registerConfig.minAge;
                }
                else {

                    Views.showWarningNotification('You do not have the minimum age required to register on this site.');
                    return;
                }
            }
        }

        if (await callback.registerCustomAuth(email, password, acceptPrivacy, acceptTos, minAge)) {

            emailInput.value = '';
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            acceptPrivacyTosCheckbox.checked = false;
            registerConfirmAgeCheckbox.checked = false;

            Views.showSuccessNotification('Please check your email to complete the registration.');
            Views.hideOpenModals();
        }
    }

    export function validateEmail(email: string): boolean {

        const match = email.match(/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+\.[a-zA-Z]{2,}$/i);
        return match && (match.length > 0);
    }

    function validatePassword(password: string): boolean {

        return password.length >= registerConfig.minPasswordLength;
    }
}