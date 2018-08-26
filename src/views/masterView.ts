import {StatisticsRepository} from "../services/statisticsRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {UsersView} from "./usersView";
import {UserRepository} from "../services/userRepository";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {DocumentationView} from "./documentationView";
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "./threadsView";
import {ViewsExtra} from "./extra";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadMessagesView} from "./threadMessagesView";

export module MasterView {

    import cE = DOMHelpers.cE;
    const FooterSeparator = ' · ';

    export function applyPageConfig(config: Pages.MasterPageConfig) {

        document.title = config.title;

        const footerLinks = document.getElementById('subnav-links');

        for (let footerLink of config.navLinks) {

            footerLinks.appendChild(createNavLink(footerLink));
        }
    }

    function createNavLink(link: Pages.PageLink) : HTMLLIElement {

        const linkElement = cE('a') as HTMLAnchorElement;

        if (link.link) {

            linkElement.setAttribute('href', link.link);
            DOMHelpers.addRelAttribute(linkElement);
        }
        else if (link.docName) {

            Views.onClick(linkElement, () => DocumentationView.showDocumentation(link.docName));
        }
        linkElement.innerText = link.title;

        const result = cE('li') as HTMLLIElement;
        result.appendChild(linkElement);

        return result;
    }

    function getStatisticsText(statistics: StatisticsRepository.EntityCount): string {

        const values = [
            ['users', DisplayHelpers.intToString(statistics.users)],
            ['threads', DisplayHelpers.intToString(statistics.discussionThreads)],
            ['thread messages', DisplayHelpers.intToString(statistics.discussionMessages)],
            ['tags', DisplayHelpers.intToString(statistics.discussionTags)],
            ['categories', DisplayHelpers.intToString(statistics.discussionCategories)],
        ];
        return values.map(t => `${t[1]} ${t[0]}`).join(FooterSeparator);
    }

    function showOnlineUsers(link: HTMLAnchorElement, users: UserRepository.User[]) {

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

    export function updateStatistics(): void {

        StatisticsRepository.getEntityCount().then(value => {

            const span = document.getElementById('entity-count');
            span.innerText = getStatisticsText(value);
        });
        UserRepository.getOnlineUsers().then(users => {

            const link = document.getElementById('users-online') as HTMLAnchorElement;
            showOnlineUsers(link, users || []);
        })
    }

    function updateRecentThreads(): void {

        const request: ThreadRepository.GetThreadsRequest = {
            page: 0,
            orderBy: 'created',
            sort: 'descending',
        };

        const container = document.getElementsByClassName('recent-threads-content')[0] as HTMLElement;
        container.innerHTML = '';

        Views.changeContent(container, async () => {

            const value = await ThreadRepository.getThreads(request);

            value.threads = value.threads || [];

            return ThreadsView.createRecentThreadsView(value.threads);
        }).then(() => {

            ViewsExtra.refreshMath(container);
        });
    }

    function updateRecentThreadMessages(): void {

        const container = document.getElementsByClassName('recent-messages-content')[0] as HTMLElement;
        container.innerHTML = '';

        Views.changeContent(container, async () => {

            const value = await ThreadMessageRepository.getLatestThreadMessages();

            value.messages = value.messages || [];

            return ThreadMessagesView.createRecentThreadMessagesView(value.messages);
        }).then(() => {

            ViewsExtra.refreshMath(container);
        });
    }

    export function showRecentThreadsModal(): void {

        const recentThreadsModal = document.getElementById('recent-threads-modal');

        updateRecentThreads();

        Views.showModal(recentThreadsModal);
    }

    export function showRecentThreadMessagesModal(): void {

        const recentThreadMessagesModal = document.getElementById('recent-thread-messages-modal');

        updateRecentThreadMessages();

        Views.showModal(recentThreadMessagesModal);
    }

    export function setupRecentModal(): void {

        const recentThreadsModalLink = document.getElementById('recent-threads-modal-link');
        Views.onClick(recentThreadsModalLink, showRecentThreadsModal);

        const recentThreadMessagesModalLink = document.getElementById('recent-thread-messages-modal-link');
        Views.onClick(recentThreadMessagesModalLink, showRecentThreadMessagesModal);
    }
}