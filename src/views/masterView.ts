import {StatisticsRepository} from "../services/statisticsRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {UsersView} from "./usersView";
import {UserRepository} from "../services/userRepository";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";

export module MasterView {

    import cE = DOMHelpers.cE;
    const FooterSeparator = ' · ';

    export function applyPageConfig(config: Pages.MasterPageConfig) {

        document.title = config.title;

        const footerLinks = document.getElementById('subnav-links');
        let insertBefore = footerLinks.children[0];

        for (let footerLink of config.footerLinks.reverse()) {

            const newLink = createFooterLink(footerLink);
            footerLinks.insertBefore(newLink, insertBefore);
            insertBefore = newLink;
        }
    }

    function createFooterLink(link: Pages.PageLink) : HTMLLIElement {

        const linkElement = cE('a') as HTMLAnchorElement;
        linkElement.setAttribute('href', link.link);
        DOMHelpers.addRelAttribute(linkElement);

        linkElement.innerText = link.title;

        const result = cE('li') as HTMLLIElement;
        result.appendChild(linkElement);

        return result;
    }

    export function getStatisticsText(statistics: StatisticsRepository.EntityCount): string {

        const values = [
            ['users', DisplayHelpers.intToString(statistics.users)],
            ['threads', DisplayHelpers.intToString(statistics.discussionThreads)],
            ['thread messages', DisplayHelpers.intToString(statistics.discussionMessages)],
            ['tags', DisplayHelpers.intToString(statistics.discussionTags)],
            ['categories', DisplayHelpers.intToString(statistics.discussionCategories)],
        ];
        return values.map(t => `${t[1]} ${t[0]}`).join(FooterSeparator);
    }

    export function showOnlineUsers(link: HTMLAnchorElement, users: UserRepository.User[]) {

        link.innerText = '';
        link = DOMHelpers.removeEventListeners(link);

        link.innerText = DisplayHelpers.intToString(users.length) + ' users online';

        Views.onClick(link, () => {

            const modal = document.getElementById('online-users-modal');
            const content = modal.getElementsByClassName('online-users-content')[0];

            content.innerHTML = '';

            Views.showModal(modal);

            content.appendChild(UsersView.createUserListContent(users));
        });
    }
}