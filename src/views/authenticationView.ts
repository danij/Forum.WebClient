import {PageActions} from '../pages/action';
import {DOMHelpers} from '../helpers/domHelpers';
import {Views} from './common';
import {ThreadsPage} from '../pages/threadsPage';
import {ConsentRepository} from '../services/consentRepository';
import {ConsentView} from './consentView';
import {DocumentationView} from './documentationView';
import {Privileges} from "../services/privileges";
import {MasterView} from "./masterView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {PrivateMessagesView} from "./privateMessagesView";
import {ThemeRepository} from "../services/themeRepository";

export module AuthenticationView {

    interface RegisterConfig {

        enableRegistration: boolean,
        minAge: number,
        minPasswordLength: number,
        reCAPTCHASiteKey: string
    }

    declare const registerConfig: RegisterConfig;

    declare const grecaptcha: any;

    export function isRegistrationEnabled(): boolean {

        return registerConfig.enableRegistration;
    }

    export function checkAuthentication(authCallback: PageActions.IAuthCallback,
                                        userCallback: PageActions.IUserCallback,
                                        privateMessagesCallback: PageActions.IPrivateMessageCallback): void {

        authCallback.getCurrentUser().then(currentUser => {

            if (null == currentUser) return;

            if (currentUser.authenticated) {

                DOMHelpers.hide(document.getElementById('login-link'));
                DOMHelpers.unHide(document.getElementById('logged-in-link'));

                Views.onClickRemoveListeners(document.getElementById('vote-history-link'), () => {

                    MasterView.showVoteHistoryModal();
                    updateVoteHistoryNr(0);
                });

                Views.onClickRemoveListeners(document.getElementById('quote-history-link'), () => {

                    MasterView.showQuoteHistoryModal();
                    updateQuoteHistoryNr(0);
                });

                Views.onClickRemoveListeners(document.getElementById('private-messages-link'), () => {

                    PrivateMessagesView.displayPrivateMessages(privateMessagesCallback, userCallback);
                    updateReceivedPrivateMessagesNr(0);
                });

                updateVoteHistoryNr(currentUser.newReceivedVotesNr);
                updateQuoteHistoryNr(currentUser.newReceivedQuotesNr);
                updateReceivedPrivateMessagesNr(currentUser.newReceivedPrivateMessagesNr);
            }
            else {

                DOMHelpers.unHide(document.getElementById('login-link'));
                DOMHelpers.hide(document.getElementById('logged-in-link'));

                return;
            }

            if (currentUser.user) {

                Privileges.User.updateCurrentUserId(currentUser.user.id);

                const myUserLink = document.getElementById('my-user-link');
                DOMHelpers.unHide(myUserLink);
                myUserLink.innerText = currentUser.user.name;

                Views.onClickRemoveListeners(myUserLink, () => {

                    new ThreadsPage().displayForLoadedUser(currentUser.user);
                });
            }
            else {

                const createUserLink = document.getElementById('create-user-name-link');
                DOMHelpers.unHide(createUserLink);
                Views.onClickRemoveListeners(createUserLink, () => showCreateUserModal(userCallback));

                showCreateUserModal(userCallback);
            }

            if (authCallback.usingCustomAuthentication()) {

                const changePasswordLink = DOMHelpers.removeEventListeners(document.getElementById('change-password-link'));

                DOMHelpers.unHide(changePasswordLink);
                Views.onClickRemoveListeners(changePasswordLink, () => showChangePasswordModal(authCallback));
            }

            Views.onClickRemoveListeners(document.getElementById('logout-link'), () => {
                authCallback.logout();
            });
        })
    }

    export function updateVoteHistoryNr(value: number): void {

        document.getElementById('vote-history-nr').innerText = DisplayHelpers.intToString(value);
    }

    export function updateQuoteHistoryNr(value: number): void {

        document.getElementById('quote-history-nr').innerText = DisplayHelpers.intToString(value);
    }

    export function updateReceivedPrivateMessagesNr(value: number): void {

        document.getElementById('private-messages-nr').innerText = DisplayHelpers.intToString(value);
    }

    function showCreateUserModal(userCallback: PageActions.IUserCallback) {

        const modal = document.getElementById('create-user-name-modal');
        const createButton = DOMHelpers.removeEventListeners(document.getElementById('create-user-name-button'));

        const toReplace = {

            userNameMinLength: Views.DisplayConfig.userNameLengths.min,
            userNameMaxLength: Views.DisplayConfig.userNameLengths.max,
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

        if (! isRegistrationEnabled()) {

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
        const registerCheckNotARobotContainer = document.getElementById('register-check-not-a-robot');
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

        if (renderCheckNotARobot(registerCheckNotARobotContainer)) {

            DOMHelpers.unHide(registerCheckNotARobotContainer);
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
        const registerCheckNotARobotContainer = document.getElementById('register-check-not-a-robot');

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

        const notARobotResponse = getNotARobotResponse(registerCheckNotARobotContainer);

        if (shouldCheckNotARobot() && (! notARobotResponse)) {

            Views.showWarningNotification('Please complete the not a robot test.');
            return;
        }

        if (await callback.registerCustomAuth(email, password, acceptPrivacy, acceptTos, minAge, notARobotResponse)) {

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

    function showChangePasswordModal(callback: PageActions.IAuthCallback) {

        const modal = document.getElementById('change-password-modal');
        const changePasswordButton = DOMHelpers.removeEventListeners(
            document.getElementById('change-password-button') as HTMLButtonElement);

        const changePasswordCheckNotARobotContainer = document.getElementById('change-password-check-not-a-robot');

        if (renderCheckNotARobot(changePasswordCheckNotARobotContainer)) {

            DOMHelpers.unHide(changePasswordCheckNotARobotContainer);
        }

        Views.onClickWithSpinner(changePasswordButton, async () => {

            const emailInput = document.getElementById('change-password-email') as HTMLInputElement;
            const email = emailInput.value;
            const oldPasswordInput = document.getElementById('change-password-old-password') as HTMLInputElement;
            const oldPassword = oldPasswordInput.value;
            const newPasswordInput = document.getElementById('change-password-new-password') as HTMLInputElement;
            const newPassword = newPasswordInput.value;
            const confirmPasswordInput = document.getElementById('change-password-password-confirm') as HTMLInputElement;
            const confirmPassword = confirmPasswordInput.value;

            if (! validateEmail(email)) {

                Views.showWarningNotification('Invalid email address!');
                return;
            }
            if (oldPassword.length < 1) {

                Views.showWarningNotification('Please specify the old password');
                return;
            }
            if (! validatePassword(newPassword)) {

                Views.showWarningNotification('Please use a more complex password!');
                return;
            }
            if (newPassword != confirmPassword) {

                Views.showWarningNotification('Passwords do not match!');
                return;
            }

            const changePasswordCheckNotARobotContainer = document.getElementById('change-password-check-not-a-robot');
            const notARobotResponse = getNotARobotResponse(changePasswordCheckNotARobotContainer);

            if (shouldCheckNotARobot() && (! notARobotResponse)) {

                Views.showWarningNotification('Please complete the not a robot test.');
                return;
            }

            if (await callback.changeCustomPassword(email, oldPassword, newPassword, notARobotResponse)) {

                emailInput.value = '';
                oldPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';

                Views.showSuccessNotification('Password changed.');
                Views.hideOpenModals();
            }
        });

        Views.showModal(modal);
    }

    const reCaptchaAttribute = 'data-widget-id';

    export function shouldCheckNotARobot(): boolean {

        return !! registerConfig.reCAPTCHASiteKey;
    }

    export function renderCheckNotARobot(container: HTMLElement): boolean {

        if ( ! registerConfig.reCAPTCHASiteKey) return false;

        const existingId = container.getAttribute(reCaptchaAttribute);
        if (existingId) {

            grecaptcha.reset(existingId);
        } else {

            let options = {

                sitekey: registerConfig.reCAPTCHASiteKey,
            };

            const currentTheme = ThemeRepository.getFavoriteTheme();
            if ('dark' == currentTheme) {

                options['theme'] = 'dark'
            }

            const widgetId = grecaptcha.render(container, options);
            container.setAttribute(reCaptchaAttribute, widgetId);
        }

        return true;
    }

    export function getNotARobotResponse(container: HTMLElement): string {

        const existingId = container.getAttribute(reCaptchaAttribute);
        if (existingId) {

            return grecaptcha.getResponse(existingId) || '';

        } else {

            return '';
        }
    }
}