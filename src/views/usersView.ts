import {UserRepository} from "../services/userRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {DOMHelpers} from "../helpers/domHelpers";

export module UsersView {

    import DOMAppender = DOMHelpers.DOMAppender;

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

    export function createUserLogoSmall(user: UserRepository.User): DOMAppender {

        let container = new DOMAppender('<div>', '</div>');

        let element = new DOMAppender(`<div class="author-logo pointer-cursor" style="color: ${getUserLogoColor(user.id)}">`, '</div>');
        container.append(element);
        element.appendString(user.name[0]);

        let dropdown = createUserDropdown(user, 'user-info');
        container.append(dropdown);

        return container;
    }

    export function createUserLogoForList(user: UserRepository.User): DOMAppender {

        let element = new DOMAppender(`<div class="text-avatar" style="color: ${getUserLogoColor(user.id)}">`, '</div>');
        element.appendString(user.name[0]);

        return element;
    }

    export function createAuthorSmall(user: UserRepository.User): DOMAppender {

        let element = new DOMAppender('<span class="author">', '</span>');

        let link = new DOMAppender('<a href="user">', '</a>');
        element.append(link);
        link.appendString(user.name);

        return element;
    }

    export function createAuthorSmallWithColon(user: UserRepository.User): DOMAppender {

        let element = createAuthorSmall(user);

        element.appendRaw(':&nbsp;');

        return element;
    }

    function createUserDropdown(user: UserRepository.User, classString?: string): DOMAppender {

        let content = new DOMAppender('<div>', '</div>');
        content.appendRaw(('<li>\n' +
            '    <a href="UserThreads" class="align-left">\n' +
            '        <span>Threads</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount)));

        content.appendRaw(('<li>\n' +
            '    <a href="UserMessages" class="align-left">\n' +
            '        <span>Messages</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount)));

        content.appendRaw('<li class="uk-nav-header">Activity</li>');
        content.appendRaw(('<li>\n' +
            '<span href="MyThreads" class="align-left">\n' +
            '    <span>Joined</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right" title="{joinedExpanded}" uk-tooltip>{joinedAgo}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{joinedExpanded}', DisplayHelpers.getFullDateTime(user.created))
            .replace('{joinedAgo}', DisplayHelpers.getAgoTimeShort(user.created)));

        content.appendRaw(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Last seen</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right" title="{lastSeenExpanded}" uk-tooltip>{lastSeenAgo}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{lastSeenExpanded}', DisplayHelpers.getFullDateTime(user.lastSeen))
            .replace('{lastSeenAgo}', DisplayHelpers.getAgoTimeShort(user.lastSeen)));

        content.appendRaw('<li class="uk-nav-header">Feedback Received</li>');
        content.appendRaw(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Up votes</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{receivedUpVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{receivedUpVotes}', DisplayHelpers.intToString(user.receivedUpVotes)));
        content.appendRaw(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Down votes</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{receivedDownVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{receivedDownVotes}', DisplayHelpers.intToString(user.receivedDownVotes)));

        return Views.createDropdown(user.name, content, {
            mode: 'hover',
            pos: 'bottom-right',
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
                                           onPageNumberChange: Views.PageNumberChangeCallback) {

        collection = collection || UserRepository.defaultUserCollection();

        let result = new UsersPageContent();

        let resultList = $("<div></div>");

        resultList.append(result.sortControls = createUserListSortControls(info));
        resultList.append(result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange));

        let usersList = $('<div class="users-list"></div>');
        resultList.append(usersList);

        usersList.append(createUserListContent(collection.users));

        resultList.append(result.paginationBottom = Views.createPaginationControl(collection, onPageNumberChange));

        result.list = resultList[0];
        return result;
    }

    function createUserListSortControls(info: Views.SortInfo): HTMLElement {

        return $('<div class="users-list-header">\n' +
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
            '</div>')[0];
    }

    export function createUserListContent(users: UserRepository.User[]): HTMLElement {

        let usersListGrid = new DOMAppender('<div class="uk-grid-match uk-text-center" uk-grid>', '</div>');

        if (users && users.length) {
            for (let user of users)
            {
                if (null == user) continue;

                usersListGrid.append(createUserInList(user));
            }
        }
        else {
            usersListGrid.appendRaw('<h3>No users found</h3>');
        }

        return usersListGrid.toElement();
    }

    function createUserInList(user: UserRepository.User): DOMAppender {

        let result = new DOMAppender('<div>', '</div>');

        let card = new DOMAppender('<div class="uk-card uk-card-default uk-card-body">', '</div>');
        result.append(card);

        let wrapper = new DOMAppender('<div class="user-in-list">', '</div>');
        card.append(wrapper);

        wrapper.append(createUserLogoForList(user));

        let userName = new DOMAppender('<div class="username uk-text-small">', '</div>');
        wrapper.append(userName);
        userName.appendString(user.name);

        let userTitle = new DOMAppender('<div class="usertitle uk-text-small">', '</div>');
        wrapper.append(userTitle);
        userTitle.appendString(user.title);

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Threads</a></div>\n' +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Messages</a></div>\n' +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Joined</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span title="{JoinedExpanded}" uk-tooltip>{JoinedShort}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
                .replace('{JoinedExpanded}', DisplayHelpers.getFullDateTime(user.created))
                .replace('{JoinedShort}', DisplayHelpers.getShortDate(user.created)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Last Seen</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span title="{LastSeenExpanded}" uk-tooltip>{LastSeenShort}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
                .replace('{LastSeenExpanded}', DisplayHelpers.getFullDateTime(user.lastSeen))
                .replace('{LastSeenShort}', DisplayHelpers.getShortDate(user.lastSeen)));

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
}