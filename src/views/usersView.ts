import {UserRepository} from "../services/userRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {PageActions} from "../pages/action";
import {Privileges} from "../services/privileges";
import {EditViews} from "./edit";
import {UsersPage} from "../pages/usersPage";
import {ThreadsPage} from "../pages/threadsPage";
import {ViewsExtra} from "./extra";
import {PrivilegesView} from "./privilegesView";

export module UsersView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;

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

        if (user.hasLogo) {

            const element = dA(`<div class="author-logo pointer-cursor">`);
            container.append(element);
            const img = dA(`<img src="${DOMHelpers.escapeStringForAttribute(Pages.getUserLogoSrc(user))}" />`);
            element.append(img);
        }
        else {

            const element = dA(`<div class="author-text-logo pointer-cursor" style="color: ${getUserLogoColor(user.id)}">`);
            container.append(element);
            element.appendString(getUserLogoInitial(user.name));
        }

        const dropdown = createUserDropdown(user, 'user-info', position);
        container.append(dropdown);

        return container;
    }

    export function createUserLogoForList(user: UserRepository.User): DOMAppender {

        if (user.hasLogo) {

            const element = dA(`<div class="logo">`);
            const img = dA(`<img src="${DOMHelpers.escapeStringForAttribute(Pages.getUserLogoSrc(user))}" />`);
            element.append(img);

            return element;
        }
        else {

            const element = dA(`<div class="text-logo" style="color: ${getUserLogoColor(user.id)}">`);
            element.appendString(getUserLogoInitial(user.name));
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

        if (UserRepository.isValidUser(user)) {

            threadsOfUserLink = `<a class="align-left" ${getThreadsOfUserLinkContent(user)}>Threads</a>`;
            threadMessagesOfUserLink = `<a class="align-left" ${getMessagesOfUserLinkContent(user)}>Messages</a>`;
            subscribedThreadsOfUserLink = `<a class="align-left" ${getSubscribedThreadsOfUserLinkContent(user)}>Subscribed Threads</a>`;
        }
        else {

            threadsOfUserLink = 'Threads';
            threadMessagesOfUserLink = 'Messages';
            subscribedThreadsOfUserLink = 'Subscribed Threads';
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

        content.appendRaw('<li class="uk-nav-header">Activity</li>');
        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            '    <span>Joined</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{joined}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{joined}', DisplayHelpers.getDateTime(user.created)));

        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            '    <span>Last seen</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{lastSeen}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{lastSeen}', DisplayHelpers.getDateTime(user.lastSeen)));

        content.appendRaw('<li class="uk-nav-header">Feedback Received</li>');
        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            '    <span>Up votes</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{receivedUpVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{receivedUpVotes}', DisplayHelpers.intToString(user.receivedUpVotes)));
        content.appendRaw(('<li>\n' +
            '<span class="align-left">\n' +
            '    <span>Down votes</span>\n' +
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
            result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        const usersList = cE('div');
        resultList.appendChild(usersList);
        usersList.classList.add('users-list');

        usersList.appendChild(createUserListContent(collection.users));

        resultList.appendChild(
            result.paginationBottom = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        result.list = resultList;
        return result;
    }

    function createUserListSortControls(info: Views.SortInfo): HTMLElement {

        return DOMHelpers.parseHTML('<div class="users-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="order-by">\n' +
            '                Sort by:\n' +
            Views.createOrderByLabel('name', 'Name', info) +
            Views.createOrderByLabel('created', 'Created', info) +
            Views.createOrderByLabel('lastseen', 'Last Seen', info) +
            Views.createOrderByLabel('threadcount', 'Thread Count', info) +
            Views.createOrderByLabel('messagecount', 'Message Count', info) +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            Views.createSortOrderOption('ascending', 'Ascending', info) +
            Views.createSortOrderOption('descending', 'Descending', info) +
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
            usersListGrid.appendRaw('<span class="uk-text-warning">No users found</span>');
        }

        const result = usersListGrid.toElement();

        Views.setupThreadsOfUsersLinks(result);
        Views.setupSubscribedThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);

        return result;
    }

    export function createUserNameElement(user: UserRepository.User, extraClass: string = ''): DOMAppender {

        const result = dA(`<div class="username uk-text-small ${extraClass}">`);
        result.appendString(user.name);

        return result;
    }

    export function createUserTitleElement(user: UserRepository.User): DOMAppender {

        const result = dA('<div class="usertitle uk-text-small">');
        result.appendString(user.title);

        return result;
    }

    function createUserInList(user: UserRepository.User): DOMAppender {

        const result = dA('<div>');

        const card = dA('<div class="uk-card uk-card-default uk-card-body">');
        result.append(card);

        const wrapper = dA('<div class="user-in-list">');
        card.append(wrapper);

        wrapper.append(createUserLogoForList(user));
        wrapper.append(createUserNameElement(user));

        wrapper.append(createUserTitleElement(user));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getThreadsOfUserLinkContent(user) + '>Threads</a></div>\n' +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getMessagesOfUserLinkContent(user) + '>Messages</a></div>\n' +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getSubscribedThreadsOfUserLinkContent(user) + '>Subscribed</a></div>\n' +
            '    <div class="uk-float-right">{nrOfSubscribedThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfSubscribedThreads}', DisplayHelpers.intToString(user.subscribedThreadCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Joined</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span>{Joined}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{Joined}', DisplayHelpers.getShortDate(user.created)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Last Seen</div>\n' +
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

        if (user.title && user.title.length) {

            const title = dA('<div class="usertitle uk-text-small">');
            left.append(title);
            title.appendString(user.title);
        }

        const threadsLink = '<a ' + getThreadsOfUserLinkContent(user) + '>threads</a>';
        const threadMessagesLink = '<a ' + getMessagesOfUserLinkContent(user) + '>messages</a>';
        const subscribedThreadsLink = '<a ' + getSubscribedThreadsOfUserLinkContent(user) + '>subscribed threads</a>';

        let messageCommentsLink = '';

        if (Privileges.User.canViewUserComments(user)) {

            messageCommentsLink = ' · <a ' + getMessageCommentsWrittenByUserLinkContent(user) + '>show written comments</a>';
        }
        const assignedPrivilegesLink = ' · <a class="show-assigned-privileges-of-user">show assigned privileges</a>';

        result.appendRaw(('<div>\n' +
            `    <p>{threadCount} ${threadsLink}` +
            ` · {messageCount} ${threadMessagesLink}` +
            ` · {subscribedThreadCount} ${subscribedThreadsLink}${messageCommentsLink}${assignedPrivilegesLink}` +
            ` <span class="uk-label score-up">+ {upVotes}</span>` +
            ` <span class="uk-label score-down">− {downVotes}</span></p>\n` +
            '    <p>Joined <span class="uk-text-meta">{joined}</span>' +
            ' · Last seen <span class="uk-text-meta">{lastSeen}</span>\n' +
            ' · Signature: <span class="uk-text-meta">{signature}</span></p>\n' +
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
        );
        if (user.info && user.info.length) {

            const info = dA('<div class="uk-text-primary uk-text-small render-style">');
            result.append(info);

            info.appendString(user.info);
        }
        {
            const editContent = [];

            if (Privileges.User.canEditUserName(user)) {

                editContent.push('<a class="edit-user-name-link">Edit name</a>');
            }
            if (Privileges.User.canEditUserInfo(user)) {

                editContent.push('<a class="edit-user-info-link">Edit info</a>');
            }
            if (Privileges.User.canEditUserTitle(user)) {

                editContent.push('<a class="edit-user-title-link">Edit title</a>');
            }
            if (Privileges.User.canEditUserSignature(user)) {

                editContent.push('<a class="edit-user-signature-link">Edit signature</a>');
            }
            if (Privileges.User.canEditUserLogo(user)) {

                editContent.push('<a class="clear-user-logo-link">Remove logo</a>');
                editContent.push('<a class="edit-user-logo-link">Upload new logo</a>');
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

        const toRender = resultElement.getElementsByClassName('render-style');
        DOMHelpers.forEach(toRender, ViewsExtra.expandAndAdjust);

        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-name-link')[0], async (ev) =>{

            ev.preventDefault();
            const name = EditViews.getInput('Edit user name', user.name);
            if (name && name.length && (name != user.name)) {

                if (await callback.editUserName(user.id, name)) {

                    new ThreadsPage().displayForUser(name);
                }
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-title-link')[0], (ev) =>{

            ev.preventDefault();
            const title = EditViews.getInput('Edit user title', user.title);
            if ((null !== title) && (title != user.title)) {

                EditViews.reloadPageIfOk(callback.editUserTitle(user.id, title));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-info-link')[0], (ev) =>{

            ev.preventDefault();
            const info = EditViews.getInput('Edit user info', user.info);
            if ((null !== info) && (info != user.info)) {

                EditViews.reloadPageIfOk(callback.editUserInfo(user.id, info));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('edit-user-signature-link')[0], (ev) =>{

            ev.preventDefault();
            const signature = EditViews.getInput('Edit user signature', user.signature);
            if ((null !== signature) && (signature != user.signature)) {

                EditViews.reloadPageIfOk(callback.editUserSignature(user.id, signature));
            }
        });
        Views.addClickIfElementExists(resultElement.getElementsByClassName('clear-user-logo-link')[0], (ev) =>{

            ev.preventDefault();
            if (EditViews.confirm('Are you sure you want to delete ' + user.name + "'s logo?")) {

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

                        Views.showWarningNotification('Only PNG files are supported as logos');
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
            if (EditViews.confirm('Are you sure you want to delete the user "' + user.name + '"?')) {

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
}