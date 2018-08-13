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

        let footerLinks = document.getElementById('footer-links');
        footerLinks.innerHTML = '';

        for (let footerLink of config.footerLinks) {

            footerLinks.appendChild(createFooterLink(footerLink));
            footerLinks.appendChild(document.createTextNode(FooterSeparator));
        }
    }

    function createFooterLink(link: Pages.PageLink) : HTMLAnchorElement {

        let result = cE('a') as HTMLAnchorElement;

        result.setAttribute('href', link.link);
        result.innerText = link.title;

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

        link.addEventListener('click', (ev) => {

            ev.preventDefault();
            let modal = document.getElementById('online-users-modal');
            let content = modal.getElementsByClassName('online-users-content')[0];

            content.innerHTML = '';

            Views.showModal(modal);

            content.appendChild(UsersView.createUserListContent(users));
        });
    }
}