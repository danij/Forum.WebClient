import {UserRepository} from '../services/userRepository';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {Views} from './common';
import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {PageActions} from '../pages/action';
import {Privileges} from '../services/privileges';
import {EditViews} from './edit';
import {UsersPage} from '../pages/usersPage';
import {ThreadsPage} from '../pages/threadsPage';
import {ViewsExtra} from './extra';
import {PrivilegesView} from './privilegesView';
import {LanguageService} from "../services/languageService";

export module UsersView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;
    import L = LanguageService.translate;

    function getUserLogoColor(id: string): string {

        let r = 283, g = 347, b = 409;
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67];

        for (let i = 0; i < id.length; ++i) {

            const char = id.charCodeAt(i);
            const ri = primes.length - (i % primes.length);
            const gi = i;
            const bi = i;

            r += (char * ri) % primes[ri % primes.length];
            g += (char * char * gi) % primes[gi % primes.length];
            b += (char * bi) % primes[bi % primes.length];
        }

        return `rgb(${r % 224}, ${g % 224}, ${b % 224})`;
    }

    function getUserLogoInitial(name: string): string {

        if ((name == UserRepository.AnonymousUserName) || (name == UserRepository.UnknownUserName)) {

            return '?';
        }
        return name[0];
    }

    export function createUserLogoSmall(user: UserRepository.User, position: string = 'bottom-right'): DOMAppender {

        const container = dA('<div>');
        const showPointer = user.id ? 'pointer-cursor' : '';

        if (user.hasLogo) {

            const element = dA(`<div class="author-logo ${showPointer}">`);
            container.append(element);
            const img = dA(`<img src="${DOMHelpers.escapeStringForAttribute(Pages.getUserLogoSrc(user))}" />`);
            element.append(img);
        }
        else {

            const element = dA(`<div class="author-text-logo ${showPointer}" style="color: ${getUserLogoColor(user.id)}">`);
            container.append(element);
            element.appendString(getUserLogoInitial(user.name));
        }

        if (position) {

            const dropdown = createUserDropdown(user, 'user-info', position);
            container.append(dropdown);
        }
        return container;
    }

    export function createUserLogoForList(user: UserRepository.User, linkToUserThreads: boolean = false): DOMAppender {

        if (user.hasLogo) {

            const element = dA(`<div class="logo">`);
            let imageContainer = element;

            if (linkToUserThreads) {

                const link = dA(`<a ${getThreadsOfUserLinkContent(user)}>`);
                element.append(link);
                imageContainer = link;
            }

            const img = dA(`<img src="${DOMHelpers.escapeStringForAttribute(Pages.getUserLogoSrc(user))}" />`);
            imageContainer.append(img);

            return element;
        }
        else {

            const element = dA(`<div class="text-logo" style="color: ${getUserLogoColor(user.id)}">`);
            let nameContainer = element;

            if (linkToUserThreads) {

                const link = dA(`<a class="user-name-link" ${getThreadsOfUserLinkContent(user)}>`);
                element.append(link);
                nameContainer = link;
            }
            nameContainer.appendString(getUserLogoInitial(user.name));
            return element;
        }
    }

    export function createAuthorSmall(user: UserRepository.User): DOMAppender {

        const element = dA('<span class="author">');

        const link = UserRepository.isValidUser(user)
            ? dA('<a ' + getThreadsOfUserLinkContent(user) + '>')
            : dA('<span>');
        element.append(link);
        link.appendString(user.name);

        return element;
    }

    function getThreadsOfUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getThreadsOfUserUrlFull(user) + '" ' + Views.UserThreadsData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function getSubscribedThreadsOfUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getSubscribedThreadsOfUserUrlFull(user) + '" ' + Views.UserSubscribedThreadsData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function getMessageCommentsWrittenByUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getThreadMessageCommentsWrittenByUserUrlFull(user) + '" ' + Views.UserWrittenThreadMessageCommentsData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function getAttachmentsAddedByUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getAttachmentsAddedByUserUrlFull(user) + '" ' + Views.UserAddedAttachmentsData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function getMessagesOfUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getThreadMessagesOfUserUrlFull(user) + '" ' + Views.UserMessagesData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function createUserDropdown(user: UserRepository.User, classString?: string,
                                       position: string = 'bottom-right'): DOMAppender {

        const content = dA('<div>');

        let threadsOfUserLink = '';
        let threadMessagesOfUserLink = '';
        let subscribedThreadsOfUserLink = '';
        let attachmentsAddedByUserLink = '';

        if (UserRepository.isValidUser(user)) {

            threadsOfUserLink = `<a class="align-left" ${getThreadsOfUserLinkContent(user)}>${L('Threads')}</a>`;
            threadMessagesOfUserLink = `<a class="align-left" ${getMessagesOfUserLinkContent(user)}>${L('Messages')}</a>`;
            subscribedThreadsOfUserLink = `<a class="align-left" ${getSubscribedThreadsOfUserLinkContent(user)}>${L('Subscribed Threads')}</a>`;
            attachmentsAddedByUserLink = `<a class="align-left" ${getAttachmentsAddedByUserLinkContent(user)}>${L('Attachments')}</a>`;
        }
        else {

            threadsOfUserLink = L('Threads');
            threadMessagesOfUserLink = L('Messages');
            subscribedThreadsOfUserLink = L('Subscribed Threads');
            attachmentsAddedByUserLink = L('Attachments');
        }

        content.appendRaw(('<li>\n' +
            '    ' + threadsOfUserLink + '\n' +
            '    <span class="uk-badge align-right">{nrOfThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount)));

        content.appendRaw(('<li>\n' +
            '    ' + threadMessagesOfUserLink + '\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount)));

        content.appendRaw(('<li>\n' +
            '    ' + subscribedThreadsOfUserLink +'\n' +
            '    <span class="uk-badge align-right">{nrOfSubscribedThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfSubscribedThreads}', DisplayHelpers.intToString(user.subscribedThreadCount)));

        if (Privileges.Attachment.canViewAllAttachments()) {

            content.appendRaw(('<li>\n' +
                '    ' + attachmentsAddedByUserLink +'\n' +
                '    <span class="uk-badge align-right">{nrOfAttachments}</span>\n' +
                '    <div class="uk-clearfix"></div>\n' +
                '</li>').replace('{nrOfAttachments}', DisplayHelpers.intToStringNull(user.attachmentCount)));
        }

        content.appendRaw(`<li class="uk-nav-header">${L('Activity')}</li>`);
        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            `    <span>${L('Joined')}</span>\n` +
            '</span>\n' +
            '    <span class="uk-badge align-right">{joined}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{joined}', DisplayHelpers.getDateTime(user.created)));

        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            `    <span>${L('Last seen')}</span>\n` +
            '</span>\n' +
            '    <span class="uk-badge align-right">{lastSeen}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{lastSeen}', DisplayHelpers.getDateTime(user.lastSeen)));

        content.appendRaw(`<li class="uk-nav-header">${L('Feedback Received')}</li>`);
        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            `    <span>${L('Up votes')}</span>\n` +
            '</span>\n' +
            '    <span class="uk-badge align-right">{receivedUpVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{receivedUpVotes}', DisplayHelpers.intToString(user.receivedUpVotes)));
        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            `    <span>${L('Down votes')}</span>\n` +
            '</span>\n' +
            '    <span class="uk-badge align-right">{receivedDownVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{receivedDownVotes}', DisplayHelpers.intToString(user.receivedDownVotes)));

        return Views.createDropdown(user.name, content, {
            mode: 'click',
            pos: position,
        }, classString);
    }

    export class UsersPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement
    }

    export function createUsersPageContent(collection: UserRepository.UserCollection,
                                           info: Views.SortInfo,
                                           onPageNumberChange: Views.PageNumberChangeCallback,
                                           getLinkForPage: Views.GetLinkForPageCallback) {

        collection = collection || UserRepository.defaultUserCollection();

        const result = new UsersPageContent();

        const resultList = cE('div');

        resultList.appendChild(result.sortControls = createUserListSortControls(info));
        resultList.appendChild(
            result.paginationTop = Views.createPaginationControl(collection, L('users'),
                onPageNumberChange, getLinkForPage));

        const usersList = cE('div');
        resultList.appendChild(usersList);
        DOMHelpers.addClasses(usersList, 'users-list');

        usersList.appendChild(createUserListContent(collection.users));

        resultList.appendChild(
            result.paginationBottom = Views.createPaginationControl(collection, L('users'),
                onPageNumberChange, getLinkForPage));

        result.list = resultList;
        return result;
    }

    function createUserListSortControls(info: Views.SortInfo): HTMLElement {

        return DOMHelpers.parseHTML('<div class="users-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="order-by">\n' +
            `                ${L('Sort by:')}\n` +
            Views.createOrderByLabel('name', L('Name'), info) +
            Views.createOrderByLabel('created', L('Created'), info) +
            Views.createOrderByLabel('lastseen', L('Last Seen'), info) +
            Views.createOrderByLabel('threadcount', L('Thread Count'), info) +
            Views.createOrderByLabel('messagecount', L('Message Count'), info) +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            Views.createSortOrderOption('ascending', L('Ascending'), info) +
            Views.createSortOrderOption('descending', L('Descending'), info) +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>');
    }

    export function createUserListContent(users: UserRepository.User[]): HTMLElement {

        const usersListGrid = dA('<div class="uk-grid-match uk-text-center uk-flex uk-flex-center" uk-grid>');

        if (users && users.length) {
            for (const user of users) {
                if (null == user) continue;

                usersListGrid.append(createUserInList(user));
            }
        }
        else {
            usersListGrid.appendRaw(`<span class="uk-text-warning">${L('No users found')}</span>`);
        }

        const result = usersListGrid.toElement();

        Views.setupThreadsOfUsersLinks(result);
        Views.setupSubscribedThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupAttachmentsAddedByUserLinks(result);

        return result;
    }

    export function createUserNameElement(user: UserRepository.User, extraClass: string = ''): DOMAppender {

        const result = dA(`<div class="username uk-text-small ${extraClass}">`);
        result.appendString(user.name);

        return result;
    }

    export function createUserTitleElement(user: UserRepository.User, keepEmptyTitle: boolean = true): DOMAppender {

        const result = dA('<div class="usertitle uk-text-small">');

        if (user.title && user.title.length) {

            result.appendString(user.title);
        }
        else if (keepEmptyTitle) {

            result.appendRaw('&nbsp;');
        }

        return result;
    }

    function createUserInList(user: UserRepository.User): DOMAppender {

        const result = dA('<div>');

        const card = dA('<div class="uk-card uk-card-default uk-card-body">');
        result.append(card);

        const wrapper = dA('<div class="user-in-list">');
        card.append(wrapper);

        wrapper.append(createUserLogoForList(user, true));
        wrapper.append(createUserNameElement(user));

        wrapper.append(createUserTitleElement(user));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getThreadsOfUserLinkContent(user) + `>${L('Threads')}</a></div>\n` +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getMessagesOfUserLinkContent(user) + `>${L('Messages')}</a></div>\n` +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getSubscribedThreadsOfUserLinkContent(user) + `>${L('Subscribed')}</a></div>\n` +
            '    <div class="uk-float-right">{nrOfSubscribedThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfSubscribedThreads}', DisplayHelpers.intToString(user.subscribedThreadCount)));

        if (Privileges.Attachment.canViewAllAttachments()) {

            wrapper.appendRaw(('<div>\n' +
                '    <div class="uk-float-left"><a ' + getAttachmentsAddedByUserLinkContent(user) + `>${L('Attachments')}</a></div>\n` +
                '    <div class="uk-float-right">{nrOfAttachments}</div>\n' +
                '    <div class="uk-clearfix"></div>\n' +
                '</div>').replace('{nrOfAttachments}', DisplayHelpers.intToStringNull(user.attachmentCount)));
        }

        wrapper.appendRaw(('<div>\n' +
            `    <div class="uk-float-left">${L('Joined')}</div>\n` +
            '    <div class="uk-float-right min-date">\n' +
            '        <span>{Joined}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{Joined}', DisplayHelpers.getShortDate(user.created)));

        wrapper.appendRaw(('<div>\n' +
            `    <div class="uk-float-left">${L('Last Seen')}</div>\n` +
            '    <div class="uk-float-right min-date">\n' +
            '        <span>{LastSeen}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{LastSeen}', DisplayHelpers.getShortDate(user.lastSeen)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="user-up-votes">\n' +
            '        <span class="uk-label">&plus; {receivedUpVotes}</span>\n' +
            '    </div>\n' +
            '    <div class="user-down-votes">\n' +
            '        <span class="uk-label">&minus; {receivedDownVotes}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{receivedUpVotes}', DisplayHelpers.intToString(user.receivedUpVotes))
            .replace('{receivedDownVotes}', DisplayHelpers.intToString(user.receivedDownVotes)));

        return result;
    }

    export function createUserPageHeader(user: UserRepository.User,
                                         callback: PageActions.IUserCallback,
                                         privilegesCallback: PageActions.IPrivilegesCallback): HTMLElement {

        const result = dA('<div class="user-header">');
        const left = dA('<div class="message-author uk-float-left">');
        result.append(left);

        left.append(createUserLogoForList(user));

        const name = dA('<div class="username uk-text-small">');
        left.append(name);
        name.appendString(user.name);

        left.append(createUserTitleElement(user));

        const threadsLink = `<a ' + getThreadsOfUserLinkContent(user) + '>${L('threads')}</a>`;
        const threadMessagesLink = `<a ' + getMessagesOfUserLinkContent(user) + '>${L('messages')}</a>`;
        const subscribedThreadsLink = (user.subscribedThreadCount >= 0)
            ? ` · {subscribedThreadCount} <a ${getSubscribedThreadsOfUserLinkContent(user)}>${L('subscribed threads')}</a>`
            : '';
        const messageCommentsLink = Privileges.User.canViewUserComments(user)
            ? ' · <a ' + getMessageCommentsWrittenByUserLinkContent(user) + `>${L('show written comments')}</a>`
             :'';
        const attachmentsLink = Privileges.User.canViewUserAttachments(user)
            ? ' · <a ' + getAttachmentsAddedByUserLinkContent(user) + `>${L('show added attachments')}</a>`
             :'';
        const assignedPrivilegesLink = ` · <a class="show-assigned-privileges-of-user">${L('show assigned privileges')}</a>`;

        result.appendRaw(('<div>\n' +
            `    <p>{threadCount} ${threadsLink}` +
            ` · {messageCount} ${threadMessagesLink}` +
            `${subscribedThreadsLink}${messageCommentsLink}${attachmentsLink}${assignedPrivilegesLink}` +
            ` <span class="uk-label score-up">+ {upVotes}</span>` +
            ` <span class="uk-label score-down">− {downVotes}</span></p>\n` +
            `    <p>${L('Joined')} <span class="uk-text-meta">{joined}</span>` +
            ` · ${L('Last seen')} <span class="uk-text-meta">{lastSeen}</span>\n` +
            ` · ${L('Signature')} <span class="uk-text-meta">{signature}</span>\n` +
            ` · ${L('Attachment Count')} <span class="uk-text-meta">{attachmentCount}</span>\n` +
            ` · ${L('Attachment Total Size')} <span class="uk-text-meta">{attachmentTotalSize}</span>\n` +
            ` · ${L('Attachment Quota')} <span class="uk-text-meta">{attachmentQuota} bytes</span></p>\n` +
            '</div>')
            .replace('{threadCount}', DisplayHelpers.intToString(user.threadCount))
            .replace('{subscribedThreadCount}', DisplayHelpers.intToString(user.subscribedThreadCount))
            .replace('{messageCount}', DisplayHelpers.intToString(user.messageCount))
            .replace('{joined}', DisplayHelpers.getDateTime(user.created))
            .replace('{lastSeen}', DisplayHelpers.getDateTime(user.lastSeen))
            .replace('{upVotes}', DisplayHelpers.intToString(user.receivedUpVotes))
            .replace('{downVotes}', DisplayHelpers.intToString(user.receivedDownVotes))
            .replace('{signature}', (user.signature && user.signature.length)
                ? DOMHelpers.escapeStringForContent(user.signature)
                : '–')
            .replace('{attachmentCount}', (user.attachmentCount)
                ? DisplayHelpers.intToString(user.attachmentCount)
                : '–')
            .replace('{attachmentTotalSize}', (user.attachmentTotalSize)
                ? DisplayHelpers.intToString(user.attachmentTotalSize)
                : '–')
            .replace('{attachmentQuota}', (user.attachmentQuota)
                ? DisplayHelpers.intToString(user.attachmentQuota)
                : '–')
        );
        if (user.info && user.info.length) {

            const info = dA('<div class="uk-text-primary uk-text-small render-style">');
            result.append(info);

            info.appendString(user.info);
        }
        {
            const editContent = [];

            if (Privileges.User.canEditUserName(user)) {

                editContent.push(`<a class="edit-user-name-link">${L('Edit name')}</a>`);
            }
            if (Privileges.User.canEditUserInfo(user)) {

                editContent.push(`<a class="edit-user-info-link">${L('Edit info')}</a>`);
            }
            if (Privileges.User.canEditUserTitle(user)) {

                editContent.push(`<a class="edit-user-title-link">${L('Edit title')}</a>`);
            }
            if (Privileges.User.canEditUserSignature(user)) {

                editContent.push(`<a class="edit-user-signature-link">${L('Edit signature')}</a>`);
            }
            if (Privileges.User.canEditUserAttachmentQuota(user)) {

                editContent.push(`<a class="edit-user-attachment-quota-link">${L('Edit attachment quota')}</a>`);
            }
            if (Privileges.User.canEditUserLogo(user)) {

                editContent.push(`<a class="clear-user-logo-link">${L('Remove profile image')}</a>`);
                editContent.push(`<a class="edit-user-logo-link">${L('Upload new profile image')}</a>`);
            }
            if (Privileges.User.canDeleteUser(user)) {

                editContent.push('<a class="delete-user-link"><span class="uk-icon" uk-icon="icon: trash"></span></a>');
            }

            if (editContent.length) {

                const editParagraph = dA('<p>');
                result.append(editParagraph);
                editParagraph.appendRaw(editContent.join(' · ') + '<input type="file" class="upload-user-logo" />');
            }
        }
        result.appendRaw('<div class="uk-clearfix"></div>');

        const resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupSubscribedThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfUsersLinks(resultElement);
        Views.setupThreadMessagesCommentsWrittenByUserLinks(resultElement);
        Views.setupAttachmentsAddedByUserLinks(resultElement);

        const toRender = resultElement.getElementsByClassName('render-style');
        DOMHelpers.forEach(toRender, ViewsExtra.expandAndAdjust);

        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-name-link')[0], async (ev) =>{

            ev.preventDefault();
            const name = EditViews.getInput(L('Edit user name'), user.name);
            if (name && name.length && (name != user.name)) {

                const min = Views.DisplayConfig.userNameLengths.min;
                const max = Views.DisplayConfig.userNameLengths.max;

                if (name.length < min) {

                    Views.showWarningNotification(L('USERNAME_MIN_LENGTH', min));
                    return;
                }
                if (name.length > max) {

                    Views.showWarningNotification(L('USERNAME_MAX_LENGTH', max));
                    return;
                }

                if (await callback.editUserName(user.id, name)) {

                    new ThreadsPage().displayForUser(name);
                }
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-title-link')[0], (ev) =>{

            ev.preventDefault();
            const title = EditViews.getInput(L('Edit user title'), user.title);
            if ((null !== title) && (title != user.title)) {

                EditViews.reloadPageIfOk(callback.editUserTitle(user.id, title));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-info-link')[0], (ev) =>{

            ev.preventDefault();
            const info = EditViews.getInput(L('Edit user info'), user.info);
            if ((null !== info) && (info != user.info)) {

                EditViews.reloadPageIfOk(callback.editUserInfo(user.id, info));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-signature-link')[0], (ev) =>{

            ev.preventDefault();
            const signature = EditViews.getInput(L('Edit user signature'), user.signature);
            if ((null !== signature) && (signature != user.signature)) {

                EditViews.reloadPageIfOk(callback.editUserSignature(user.id, signature));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-attachment-quota-link')[0], (ev) =>{

            ev.preventDefault();
            const newQuota = EditViews.getInput(L('Edit user attachment quota'),
                user.attachmentQuota ? user.attachmentQuota.toString() : '');

            if ((null !== newQuota) && (newQuota.trim().length) && (parseInt(newQuota) != user.attachmentQuota)) {

                EditViews.reloadPageIfOk(callback.editUserAttachmentQuota(user.id, parseInt(newQuota)));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('clear-user-logo-link')[0], (ev) =>{

            ev.preventDefault();
            if (EditViews.confirm(L('CONFIRM_DELETE_USER_LOGO', user.name))) {

                EditViews.reloadPageIfOk(callback.deleteUserLogo(user.id));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-logo-link')[0], (ev) =>{

            ev.preventDefault();
            const fileInput = DOMHelpers.removeEventListeners(
                document.getElementsByClassName('upload-user-logo')[0] as HTMLInputElement);

            fileInput.value = '';
            fileInput.addEventListener('change', (ev) =>
            {
                if (fileInput.files && fileInput.files.length) {

                    const file = fileInput.files[0];
                    if ('image/png' != file.type) {

                        Views.showWarningNotification(L('Only PNG files are supported as logos'));
                        return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = (ev) => {

                        ev.preventDefault();
                        EditViews.reloadPageIfOk(callback.uploadUserLogo(user.id, reader.result));
                    };
                    reader.readAsArrayBuffer(file);
                }
            });

            fileInput.click();
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('delete-user-link')[0], async (ev) =>{

            ev.preventDefault();
            if (EditViews.confirm(L('CONFIRM_DELETE_USER', user.name))) {

                if (await callback.deleteUser(user.id)) {

                    (new UsersPage).display();
                }
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('show-assigned-privileges-of-user')[0], (ev) => {

            ev.preventDefault();

            PrivilegesView.showPrivilegesAssignedToUser(user, privilegesCallback);
        });


        return resultElement;
    }

    export function createUserReferenceInMessage(user: UserRepository.User): string {

        return `<a ${getThreadsOfUserLinkContent(user)}>${DOMHelpers.escapeStringForContent(user.name)}</a>`;
    }
}