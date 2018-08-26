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
import {ScrollSpy} from "./scrollSpy";
import {ThreadsPage} from "../pages/threadsPage";
import {PageActions} from "../pages/action";

export module MasterView {

    import cE = DOMHelpers.cE;
    import IAuthCallback = PageActions.IAuthCallback;
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

    function updateRecentPage(className: string, getResult: (number) => Promise<HTMLElement>, pageNumber?: number): void {

        pageNumber = pageNumber || 0;

        if (0 == pageNumber) {

            //clear all other pages
            let i = 0;
            DOMHelpers.forEach(document.getElementsByClassName(className), element => {

                if (0 < i++) {

                    element.parentElement.removeChild(element);
                }
            });
        }

        const container = document.getElementsByClassName(className)[pageNumber] as HTMLElement;
        container.innerHTML = '';

        Views.changeContent(container, async () => {

            const result = await getResult(pageNumber);

            if (0 == pageNumber) {

                return result;
            }

            const wrapper = cE('div');
            wrapper.appendChild(DOMHelpers.parseHTML('<hr class="uk-divider-icon" />'));
            wrapper.appendChild(result);

            return wrapper;

        }).then(() => {

            ViewsExtra.refreshMath(container);
        });
    }

    function updateRecentThreads(pageNumber?: number): void {

        updateRecentPage('recent-threads-content', async (page) => {

            const request: ThreadRepository.GetThreadsRequest = {
                page: page,
                orderBy: 'created',
                sort: 'descending',
            };

            const value = await ThreadRepository.getThreads(request);

            value.threads = value.threads || [];

            return ThreadsView.createRecentThreadsView(value.threads);

        }, pageNumber);
    }

    function loadNewRecentThreadsPage(): void {

        const allPages = document.getElementsByClassName('recent-threads-content');

        if (allPages[allPages.length - 1].getElementsByClassName('uk-text-warning').length > 0) {

            return; //no more threads
        }

        const newPageNumber = allPages.length;

        const newPage = DOMHelpers.parseHTML('<div class="recent-threads-content"></div>');
        allPages[0].parentElement.appendChild(newPage);

        updateRecentThreads(newPageNumber);
    }

    function updateRecentThreadMessages(pageNumber?: number): void {

        updateRecentPage('recent-messages-content', async (page) => {

            const value = await ThreadMessageRepository.getLatestThreadMessages(page);

            value.messages = value.messages || [];

            return ThreadMessagesView.createRecentThreadMessagesView(value.messages);

        }, pageNumber);
    }

    function loadNewRecentThreadMessagesPage(): void {

        const allPages = document.getElementsByClassName('recent-messages-content');

        if (allPages[allPages.length - 1].getElementsByClassName('uk-text-warning').length > 0) {

            return; //no more thread messages
        }

        const newPageNumber = allPages.length;

        const newPage = DOMHelpers.parseHTML('<div class="recent-messages-content"></div>');
        allPages[0].parentElement.appendChild(newPage);

        updateRecentThreadMessages(newPageNumber);
    }

    export function showRecentThreadsModal(): void {

        const recentThreadsModal = document.getElementById('recent-threads-modal');
        updateRecentThreads();

        const dialog = recentThreadsModal.getElementsByClassName('uk-modal-dialog')[0] as HTMLElement;
        ScrollSpy.enableScrollSpy(dialog, loadNewRecentThreadsPage);

        Views.showModal(recentThreadsModal);
    }

    export function showRecentThreadMessagesModal(): void {

        const recentThreadMessagesModal = document.getElementById('recent-thread-messages-modal');
        updateRecentThreadMessages();

        const dialog = recentThreadMessagesModal.getElementsByClassName('uk-modal-dialog')[0] as HTMLElement;
        ScrollSpy.enableScrollSpy(dialog, loadNewRecentThreadMessagesPage);

        Views.showModal(recentThreadMessagesModal);
    }

    export function setupRecentModal(): void {

        const recentThreadsModalLink = document.getElementById('recent-threads-modal-link');
        Views.onClick(recentThreadsModalLink, showRecentThreadsModal);

        const recentThreadMessagesModalLink = document.getElementById('recent-thread-messages-modal-link');
        Views.onClick(recentThreadMessagesModalLink, showRecentThreadMessagesModal);
    }

    export function checkAuthentication(callback: PageActions.IAuthCallback): void {

        callback.getCurrentUser().then(currentUser => {

            if (null == currentUser) return;

            if (currentUser.authenticated) {

                DOMHelpers.hide(document.getElementById('login-link'));
                DOMHelpers.unHide(document.getElementById('logged-in-link'));
            }

            if (currentUser.user) {

                const myUserLink = document.getElementById('my-user-link');
                DOMHelpers.unHide(myUserLink);
                myUserLink.innerText = currentUser.user.name;

                Views.onClick(myUserLink, () => {

                    new ThreadsPage().displayForLoadedUser(currentUser.user);
                });
            }
            else {

                const createUserLink = document.getElementById('create-user-link');
                DOMHelpers.unHide(createUserLink);
            }

            if (callback.usingCustomAuthentication()) {

                DOMHelpers.unHide(document.getElementById('change-password-link'));
            }

            Views.onClick(document.getElementById('logout-link'), () => { callback.logout(); });
        })
    }
}