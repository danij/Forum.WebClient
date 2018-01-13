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
}