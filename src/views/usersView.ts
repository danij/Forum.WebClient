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

    export function createAuthorSmall(user: UserRepository.User): HTMLElement {

        let element = $('<span class="author"></span>');

        let link = $('<a href="user"></a>');
        element.append(link);
        link.text(user.name);
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
            '</li>').replace('{nrOfThreads}', user.threadCount.toString())));

        content.append($(('<li>\n' +
            '    <a href="UserMessages" class="align-left">\n' +
            '        <span>Messages</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', user.messageCount.toString())));

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
            '</li>').replace('{upVotes}', (user.upVotes || 0).toString())));
        content.append($(('<li>\n' +
            '<span href="MyMessages" class="align-left">\n' +
            '    <span>Down votes</span>\n' +
            '</span>\n' +
            '    <span class="uk-badge align-right">{downVotes}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{downVotes}', (user.downVotes || 0).toString())));

        return Views.createDropdown(user.name, content, {
            mode: 'hover',
            pos: 'bottom-right'
        });
    }
}