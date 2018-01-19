import {HomePage} from "./homePage";
import {TagsPage} from "./tagsPage";
import {ThreadsPage} from "./threadsPage";
import {UsersPage} from "./usersPage";
import {Pages} from "./common";
import {Views} from "../views/common";
import {StatisticsRepository} from "../services/statisticsRepository";
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "../views/threadsView";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadMessagesView} from "../views/threadMessagesView";
import {ThreadMessagesPage} from "./threadMessagesPage";
import {MasterView} from "../views/masterView";
import {ViewsExtra} from "../views/extra";
import {UserRepository} from "../services/userRepository";
import {ThreadMessageCommentsPage} from "./threadMessageCommentsPage";
import {Privileges} from "../services/privileges";
import {NewThreadPage} from "./newThreadPage";
import {PageActions} from "./action";
import {UsersView} from "../views/usersView";
import {DOMHelpers} from "../helpers/domHelpers";

export module MasterPage {

    let originalTitle: string;
    let linkElements: HTMLElement[];
    let goBackInProgress: boolean = false;
    let recentThreadsLatestValue: string = '';
    let recentThreadMessagesLatestValue: string = '';

    export function bootstrap(): void {

        originalTitle = document.title;

        let pages = [

            {linkId: 'HomePageLink', factory: () => new HomePage()},
            {linkId: 'TagsPageLink', factory: () => new TagsPage()},
            {linkId: 'ThreadsPageLink', factory: () => new ThreadsPage()},
            {linkId: 'UsersPageLink', factory: () => new UsersPage()},
            {linkId: 'CommentsPageLink', factory: () => new ThreadMessageCommentsPage()},
            {linkId: 'NewThreadPageLink', factory: () => new NewThreadPage()},
        ];

        linkElements = pages.map((page) => {

            let link = document.getElementById(page.linkId);
            link.addEventListener('click', (ev) => {

                ev.preventDefault();
                page.factory().display();
            });
            return link;
        });

        setupSearch();

        let forumWidePrivileges = Privileges.getForumWidePrivileges();
        forumWidePrivileges.canViewAllComments().then((allowed) => {

            if (allowed) {

                document.getElementById('CommentsPageLink').classList.remove('uk-hidden');
            }
        });

        ViewsExtra.init();
        fixLinks();

        window.onpopstate = () => onGoBack();
        loadCurrentPage();

        setupUpdates();
    }

    function fixLinks() {

        for (let element of linkElements) {

            let link = element.getElementsByTagName('a')[0] as HTMLAnchorElement;
            let href = link.getAttribute('data-href');
            link.href = Pages.getUrl(href);
        }
    }

    function onGoBack() {

        try {
            goBackInProgress = true;
            loadCurrentPage();
        }
        finally {
            goBackInProgress = false;
        }
    }

    export function goTo(url: string, title: string) {

        for (let link of linkElements) {

            link.classList.remove('uk-active');
        }

        const fullTitle = getTitle(title);

        if (goBackInProgress) {
            window.history.replaceState(null, fullTitle, Pages.getUrl(url));
        }
        else {
            window.history.pushState(null, getTitle(title), Pages.getUrl(url));
        }

        document.title = fullTitle;
    }

    export function getTitle(extra: string): string {

        if (extra && extra.length) {

            return `${originalTitle} – ${extra}`;
        }
        return originalTitle;
    }

    declare const masterPageConfig: Pages.MasterPageConfig;

    function loadCurrentPage(): void {

        const functions = [

            HomePage.loadPage,
            TagsPage.loadPage,
            NewThreadPage.loadPage,
            ThreadsPage.loadPage,
            ThreadMessagesPage.loadPage,
            UsersPage.loadPage,
            ThreadMessageCommentsPage.loadPage
        ];

        let location = window.location.toString().toLowerCase().replace(/\\/g, '/');
        if (location.indexOf(masterPageConfig.baseUri) == 0) {
            location = location.substr(masterPageConfig.baseUri.length);
            if (location.length > 0 && location[0] == '/') {
                location = location.substr(1);
            }
            if (location.indexOf('/') < 0) {
                location = location + '/';
            }
        }

        for (let fn of functions) {

            if (fn(location)) {
                return;
            }
        }

        //default
        new HomePage().display();
    }

    function setupUpdates(): void {

        updateStatistics();
        setInterval(updateStatistics, Views.DisplayConfig.updateStatisticsEveryMilliSeconds);

        updateRecentThreads();
        setInterval(updateRecentThreads, Views.DisplayConfig.updateRecentThreadsEveryMilliSeconds);

        updateRecentThreadMessages();
        setInterval(updateRecentThreadMessages, Views.DisplayConfig.updateRecentThreadMessagesEveryMilliSeconds);
    }

    function updateStatistics(): void {

        StatisticsRepository.getEntityCount().then(value => {

            let span = document.getElementById('entityCount');
            span.innerText = MasterView.getStatisticsText(value);
        });
        UserRepository.getOnlineUsers().then(users => {

            let link = document.getElementById('usersOnline') as HTMLAnchorElement;
            MasterView.showOnlineUsers(link, users || []);
        })
    }

    function updateRecentThreads(): void {

        const request: ThreadRepository.GetThreadsRequest = {
            page: 0,
            orderBy: 'created',
            sort: 'descending'
        };

        ThreadRepository.getThreads(request).then(value => {

            value.threads = value.threads || [];
            let latestValue = calculateRecentThreadsLatestValue(value.threads);
            if (latestValue == recentThreadsLatestValue) return;

            recentThreadsLatestValue = latestValue;

            let panel = document.getElementsByClassName('recent-threads-content')[0] as HTMLElement;

            panel.innerHTML = '';
            panel.appendChild(ThreadsView.createRecentThreadsView(value.threads));

            ViewsExtra.refreshMath(panel);
        });
    }

    function calculateRecentThreadsLatestValue(threads: ThreadRepository.Thread[]) {

        let result = [];
        for (let thread of threads) {

            result.push(thread.id);
            result.push(thread.createdBy.id);
            result.push(thread.voteScore);
            result.push(thread.name);
        }

        return result.join('-');
    }

    function updateRecentThreadMessages(): void {

        ThreadMessageRepository.getLatestThreadMessages().then(value => {

            value.messages = value.messages || [];
            let latestValue = calculateRecentThreadMessagesLatestValue(value.messages);
            if (latestValue == recentThreadMessagesLatestValue) return;

            recentThreadMessagesLatestValue = latestValue;

            let panel = document.getElementsByClassName('recent-messages-content')[0] as HTMLElement;

            panel.innerHTML = '';
            panel.appendChild(ThreadMessagesView.createRecentThreadMessagesView(value.messages));

            ViewsExtra.refreshMath(panel);
        });
    }

    function calculateRecentThreadMessagesLatestValue(messages: ThreadMessageRepository.ThreadMessage[]) {

        let result = [];
        for (let message of messages) {

            result.push(message.id);
            result.push(message.content);
            result.push(message.parentThread.id);
            result.push(message.parentThread.name);
            result.push(message.createdBy.id);
        }

        return result.join('-');
    }

    function setupSearch(): void {

        let searchLink = document.getElementById('showSearchModal');
        searchLink.addEventListener('click', (ev) => {

            ev.preventDefault();

            let modal = document.getElementById('search-modal');
            Views.showModal(modal);

            let searchButton = document.getElementById('searchButton');
            searchButton = DOMHelpers.removeEventListeners(searchButton);

            searchButton.addEventListener('click', (ev) => {

                ev.preventDefault();

                const input = (document.getElementById('searchInput') as HTMLInputElement).value;
                if (input.trim().length < 1) return;

                const checkedSearchType = modal.querySelectorAll('input[name=searchFor]:checked');
                if (checkedSearchType.length < 1) return;

                let resultsContainer = modal.getElementsByClassName('search-results-container')[0] as HTMLElement;

                switch ((checkedSearchType[0] as HTMLInputElement).value){

                    case 'user':
                        searchUser(input, resultsContainer);
                        break;
                    case 'thread':
                        searchThread(input, resultsContainer);
                        break;
                    case 'threadMessage':
                        searchThreadMessage(input, resultsContainer);
                        break;
                }
            });
        });
    }

    function searchUser(toSearch: string, resultsContainer: HTMLElement): void {

        PageActions.getUserCallback().searchUsersByName(toSearch).then((users) => {

            let container = DOMHelpers.parseHTML('<div class="users-list"></div>');
            container.appendChild(UsersView.createUserListContent(users));

            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(container);
        });
    }

    function searchThread(toSearch: string, resultsContainer: HTMLElement): void {

        PageActions.getThreadCallback().searchThreadsByName(toSearch).then((threads) => {

            let container = DOMHelpers.parseHTML('<div class="threads-table uk-margin-left"></div>');
            container.appendChild(ThreadsView.createThreadsTable(threads));

            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(container);
            ViewsExtra.refreshMath(container);
        });
    }

    function searchThreadMessage(toSearch: string, resultsContainer: HTMLElement): void {

        PageActions.getThreadMessageCallback().searchThreadMessagesByName(toSearch).then((messages) => {

            resultsContainer.innerHTML = '';

            resultsContainer.appendChild(ThreadMessagesView.createThreadMessageList(messages,
                PageActions.getThreadMessageCallback(), Privileges.getThreadMessagePrivileges(),
                PageActions.getThreadCallback(), Privileges.getThreadPrivileges()));

            ViewsExtra.refreshMath(resultsContainer);
        });
    }
}