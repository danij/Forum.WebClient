import {UserRepository} from "../services/userRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";

export module UsersView {

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

    export function createUserLogoSmall(user: UserRepository.User): HTMLElement {

        let container = $('<div></div>');

        let element = $('<div class="author-logo pointer-cursor"></div>');
        container.append(element);
        element.text(user.name[0]);
        element.css('color', getUserLogoColor(user.id));

        let dropdown = $(createUserDropdown(user));
        container.append(dropdown);
        dropdown.addClass('user-info');

        return container[0];
    }

    export function createUserLogoForList(user: UserRepository.User): HTMLElement {

        let element = $('<div class="text-avatar"></div>');
        element.text(user.name[0]);
        element.css('color', getUserLogoColor(user.id));

        return element[0];
    }

    export function createAuthorSmall(user: UserRepository.User): HTMLElement {

        let element = $('<span class="author"></span>');

        let link = $('<a href="user"></a>');
        element.append(link);
        link.text(user.name);

        return element[0];
    }

    export function createAuthorSmallWithColon(user: UserRepository.User): HTMLElement {

        let element = $(createAuthorSmall(user));

        element.append(':&nbsp;');

        return element[0];
    }

    function createUserDropdown(user: UserRepository.User): HTMLElement {

        let content = $('<div></div>');
        content.append($(('<li>\n' +
            '    <a href="UserThreads" class="align-left">\n' +
            '        <span>Threads</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount))));

        content.append($(('<li>\n' +
            '    <a href="UserMessages" class="align-left">\n' +
            '        <span>Messages</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount))));

        content.append($('<li class="uk-nav-header">Activity</li>'));
        content.append($(('<li>\n' +
            '<span href="MyThreads" class="align-left">\n' +
            '    <span>Joined</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right" title="{joinedExpanded}" uk-tooltip>{joinedAgo}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{joinedExpanded}', DisplayHelpers.getFullDateTime(user.created))
            .replace('{joinedAgo}', DisplayHelpers.getAgoTimeShort(user.created))));

        content.append($(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Last seen</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right" title="{lastSeenExpanded}" uk-tooltip>{lastSeenAgo}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>')
            .replace('{lastSeenExpanded}', DisplayHelpers.getFullDateTime(user.lastSeen))
            .replace('{lastSeenAgo}', DisplayHelpers.getAgoTimeShort(user.lastSeen))));

        content.append($('<li class="uk-nav-header">Feedback Received</li>'));
        content.append($(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Up votes</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{upVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{upVotes}', DisplayHelpers.intToString(user.upVotes))));
        content.append($(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Down votes</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{downVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{downVotes}', DisplayHelpers.intToString(user.downVotes))));

        return Views.createDropdown(user.name, content, {
            mode: 'hover',
            pos: 'bottom-right'
        });
    }

    export function createUsersList(collection: UserRepository.UserCollection): HTMLElement {

        let result = $("<div></div>");

        result.append(createUserListSortControls());
        result.append(Views.createPaginationControl(collection));

        let usersList = $('<div class="users-list"></div>');
        result.append(usersList);

        let usersListGrid = $('<div class="uk-grid-match uk-text-center" uk-grid></div>');
        usersList.append(usersListGrid);

        for (let user of collection.users)
        {
            if (null == user) continue;

            usersListGrid.append(createUserInList(user));
        }
        result.append(Views.createPaginationControl(collection));

        return result[0];
    }

    function createUserListSortControls(): HTMLElement {

        return $('<div class="users-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="user-list-sort-order">\n' +
            '                Sort by:\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" checked> Name</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy"> Created</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy"> Last Seen</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy"> Thread Count</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy"> Message Count</label>\n' +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="orderDirection">\n' +
            '                    <option>Ascending</option>\n' +
            '                    <option>Descending</option>\n' +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>')[0];
    }

    function createUserInList(user: UserRepository.User): HTMLElement {

        let result = $('<div></div>');

        let card = $('<div class="uk-card uk-card-default uk-card-body"></div>');
        result.append(card);

        let wrapper = $('<div class="user-in-list"></div>');
        card.append(wrapper);

        wrapper.append(createUserLogoForList(user));

        let userName = $('<div class="username uk-text-small"></div>');
        wrapper.append(userName);
        userName.text(user.name);

        let userTitle = $('<div class="usertitle uk-text-small"></div>');
        wrapper.append(userTitle);
        userTitle.text(user.title);

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Threads</a></div>\n' +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(user.threadCount))));

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Messages</a></div>\n' +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(user.messageCount))));

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left">Joined</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span title="{JoinedExpanded}" uk-tooltip>{JoinedShort}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
                .replace('{JoinedExpanded}', DisplayHelpers.getFullDateTime(user.created))
                .replace('{JoinedShort}', DisplayHelpers.getShortDate(user.created))));

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left">Last Seen</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span title="{LastSeenExpanded}" uk-tooltip>{LastSeenShort}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
                .replace('{LastSeenExpanded}', DisplayHelpers.getFullDateTime(user.lastSeen))
                .replace('{LastSeenShort}', DisplayHelpers.getShortDate(user.lastSeen))));

        wrapper.append($(('<div>\n' +
            '    <div class="user-up-votes">\n' +
            '        <span class="uk-label">&plus; {upVotes}</span>\n' +
            '    </div>\n' +
            '    <div class="user-down-votes">\n' +
            '        <span class="uk-label">&minus; {downVotes}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
                .replace('{upVotes}', DisplayHelpers.intToString(user.upVotes))
                .replace('{downVotes}', DisplayHelpers.intToString(user.downVotes))));

        return result[0];
    }
}