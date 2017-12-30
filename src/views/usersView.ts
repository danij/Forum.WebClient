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

export module UsersView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import IUserCallback = PageActions.IUserCallback;
    import IUserPrivileges = Privileges.IUserPrivileges;
    import reloadPageIfOk = EditViews.reloadPageIfOk;

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

        if (name == '<anonymous>') {

            return '?';
        }
        return name[0];
    }

    export function createUserLogoSmall(user: UserRepository.User, position: string = 'bottom-right'): DOMAppender {

        let container = new DOMAppender('<div>', '</div>');

        let element = new DOMAppender(`<div class="author-logo pointer-cursor" style="color: ${getUserLogoColor(user.id)}">`, '</div>');
        container.append(element);
        element.appendString(getUserLogoInitial(user.name));

        let dropdown = createUserDropdown(user, 'user-info', position);
        container.append(dropdown);

        return container;
    }

    export function createUserLogoForList(user: UserRepository.User): DOMAppender {

        let element = new DOMAppender(`<div class="text-avatar" style="color: ${getUserLogoColor(user.id)}">`, '</div>');
        element.appendString(getUserLogoInitial(user.name));

        return element;
    }

    export function createAuthorSmall(user: UserRepository.User): DOMAppender {

        let element = new DOMAppender('<span class="author">', '</span>');

        let link = new DOMAppender('<a ' + getThreadsOfUserLinkContent(user) + '>', '</a>');
        element.append(link);
        link.appendString(user.name);

        return element;
    }

    export function getThreadsOfUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getThreadsOfUserUrlFull(user) + '" ' + Views.UserThreadsData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function getSubscribedThreadsOfUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getSubscribedThreadsOfUserUrlFull(user) + '" ' + Views.UserSubscribedThreadsData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function getMessagesOfUserLinkContent(user: UserRepository.User): string {

        return 'href="' + Pages.getThreadMessagesOfUserUrlFull(user) + '" ' + Views.UserMessagesData + '="' +
            DOMHelpers.escapeStringForAttribute(user.name) + '"';
    }

    export function createUserDropdown(user: UserRepository.User, classString?: string,
                                       position: string = 'bottom-right'): DOMAppender {

        let content = new DOMAppender('<div>', '</div>');
        content.appendRaw(('<li>\n' +
            '    <a class="align-left" ' + getThreadsOfUserLinkContent(user) + '>Threads</a>\n' +
            '    <span class="uk-badge align-right">{nrOfThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount)));

        content.appendRaw(('<li>\n' +
            '    <a class="align-left" ' + getMessagesOfUserLinkContent(user) + '>Messages</a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount)));

        content.appendRaw(('<li>\n' +
            '    <a class="align-left" ' + getSubscribedThreadsOfUserLinkContent(user) + '>Subscribed Threads</a>\n' +
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

        let result = new UsersPageContent();

        let resultList = document.createElement('div');

        resultList.appendChild(result.sortControls = createUserListSortControls(info));
        resultList.appendChild(
            result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        let usersList = document.createElement('div');
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

        let usersListGrid = new DOMAppender('<div class="uk-grid-match uk-text-center uk-flex uk-flex-center" uk-grid>', '</div>');

        if (users && users.length) {
            for (let user of users) {
                if (null == user) continue;

                usersListGrid.append(createUserInList(user));
            }
        }
        else {
            usersListGrid.appendRaw('<span class="uk-text-warning">No users found</span>');
        }

        let result = usersListGrid.toElement();

        Views.setupThreadsOfUsersLinks(result);
        Views.setupSubscribedThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);

        return result;
    }

    export function createUserNameElement(user: UserRepository.User, extraClass: string = ''): DOMAppender {

        let result = new DOMAppender(`<div class="username uk-text-small ${extraClass}">`, '</div>');
        result.appendString(user.name);

        return result;
    }

    export function createUserTitleElement(user: UserRepository.User): DOMAppender {

        let result = new DOMAppender('<div class="usertitle uk-text-small">', '</div>');
        result.appendString(user.title);

        return result;
    }

    function createUserInList(user: UserRepository.User): DOMAppender {

        let result = new DOMAppender('<div>', '</div>');

        let card = new DOMAppender('<div class="uk-card uk-card-default uk-card-body">', '</div>');
        result.append(card);

        let wrapper = new DOMAppender('<div class="user-in-list">', '</div>');
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
                                         callback: IUserCallback,
                                         privileges: IUserPrivileges): HTMLElement {

        let result = new DOMAppender('<div class="user-header">', '</div>');
        let left = new DOMAppender('<div class="message-author uk-float-left">', '</div>');
        result.append(left);

        left.append(createUserLogoForList(user));

        let name = new DOMAppender('<div class="username uk-text-small">', '</div>');
        left.append(name);
        name.appendString(user.name);

        if (user.title && user.title.length) {

            let title = new DOMAppender('<div class="usertitle uk-text-small">', '</div>');
            left.append(title);
            title.appendString(user.title);
        }

        let threadsLink = '<a ' + getThreadsOfUserLinkContent(user) + '>threads</a>';
        let threadMessagesLink = '<a ' + getMessagesOfUserLinkContent(user) + '>messages</a>';
        let subscribedThreadsLink = '<a ' + getSubscribedThreadsOfUserLinkContent(user) + '>subscribed threads</a>';

        result.appendRaw(('<div>\n' +
            `    <p>{threadCount} ${threadsLink}` +
            ` · {messageCount} ${threadMessagesLink}` +
            ` · {subscribedThreadCount} ${subscribedThreadsLink}` +
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

            let info = new DOMAppender('<div class="uk-text-primary uk-text-small">', '</div>');
            result.append(info);

            info.appendString(user.info);
        }
        {
            let editContent = [];

            if (privileges.canEditUserName(user.id)) {

                editContent.push('<a class="edit-user-name-link">Edit name</a>');
            }
            if (privileges.canEditUserInfo(user.id)) {

                editContent.push('<a class="edit-user-info-link">Edit info</a>');
            }
            if (privileges.canEditUserTitle(user.id)) {

                editContent.push('<a class="edit-user-title-link">Edit title</a>');
            }
            if (privileges.canEditUserSignature(user.id)) {

                editContent.push('<a class="edit-user-signature-link">Edit signature</a>');
            }
            if (privileges.canEditUserLogo(user.id)) {

                editContent.push('<a class="clear-user-logo-link">Remove logo</a>');
                editContent.push('<a class="edit-user-logo-link">Upload new logo</a>');
            }
            if (privileges.canDeleteUser(user.id)) {

                editContent.push('<a class="delete-user-link"><span class="uk-icon" uk-icon="icon: trash"></span></a>');
            }

            if (editContent.length) {

                let editParagraph = new DOMAppender('<p>', '<p>');
                result.append(editParagraph);
                editParagraph.appendRaw(editContent.join(' · '));
            }
        }
        result.appendRaw('<div class="uk-clearfix"></div>');

        let resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupSubscribedThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfUsersLinks(resultElement);

        resultElement.getElementsByClassName('edit-user-name-link')[0].addEventListener('click', async (ev) =>{

            ev.preventDefault();
            const name = EditViews.getInput('Edit user name', user.name);
            if (name && name.length && (name != user.name)) {

                if (await callback.editUserName(user.id, name)) {

                    new ThreadsPage().displayForUser(name);
                }
            }
        });
        resultElement.getElementsByClassName('edit-user-title-link')[0].addEventListener('click', (ev) =>{

            ev.preventDefault();
            const title = EditViews.getInput('Edit user title', user.title);
            if (title != user.title) {

                reloadPageIfOk(callback.editUserTitle(user.id, title));
            }
        });
        resultElement.getElementsByClassName('edit-user-info-link')[0].addEventListener('click', (ev) =>{

            ev.preventDefault();
            const info = EditViews.getInput('Edit user info', user.info);
            if (info != user.info) {

                reloadPageIfOk(callback.editUserInfo(user.id, info));
            }
        });
        resultElement.getElementsByClassName('edit-user-signature-link')[0].addEventListener('click', (ev) =>{

            ev.preventDefault();
            const signature = EditViews.getInput('Edit user signature', user.signature);
            if (signature != user.signature) {

                reloadPageIfOk(callback.editUserSignature(user.id, signature));
            }
        });
        resultElement.getElementsByClassName('clear-user-logo-link')[0].addEventListener('click', (ev) =>{

            ev.preventDefault();
            if (EditViews.confirm('Are you sure you want to delete ' + user.name + "'s logo?")) {

                reloadPageIfOk(callback.deleteUserLogo(user.id));
            }
        });
        resultElement.getElementsByClassName('edit-user-logo-link')[0].addEventListener('click', (ev) =>{

            ev.preventDefault();
            //TODO
        });
        resultElement.getElementsByClassName('delete-user-link')[0].addEventListener('click', async (ev) =>{

            ev.preventDefault();
            if (EditViews.confirm('Are you sure you want to delete the user "' + user.name + '"?')) {

                if (await callback.deleteUser(user.id)) {

                    (new UsersPage).display();
                }
            }
        });

        return resultElement;
    }
}