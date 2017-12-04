import {HomePage} from "./homePage";
import {TagsPage} from "./tagsPage";
import {ThreadsPage} from "./threadsPage";
import {UsersPage} from "./usersPage";
import {Pages} from "./common";
import {Views} from "../views/common";
import {StatisticsRepository} from "../services/statisticsRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "../views/threadsView";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadMessagesView} from "../views/threadMessagesView";
import {ThreadMessagesPage} from "./threadMessagesPage";
import {MasterView} from "../views/masterView";
import {ViewsExtra} from "../views/extra";

export module MasterPage {

    let originalTitle: string;
    let linkElements: HTMLElement[];
    let goBackInProgress: boolean = false;
    let recentThreadsLatestValue: string = '';
    let recentThreadMessagesLatestValue: string = '';

    export function bootstrap(): void {

        originalTitle = document.title;
        linkElements = [];

        let homePageLink = document.getElementById('HomePageLink');
        linkElements.push(homePageLink);
        homePageLink.addEventListener('click', (e) => {

            new HomePage().display();
            e.preventDefault();
        });

        let tagsPageLink = document.getElementById('TagsPageLink');
        linkElements.push(tagsPageLink);
        tagsPageLink.addEventListener('click', (e) => {

            new TagsPage().display();
            e.preventDefault();
        });

        let threadsPageLink = document.getElementById('ThreadsPageLink');
        linkElements.push(threadsPageLink);
        threadsPageLink.addEventListener('click', (e) => {

            new ThreadsPage().display();
            e.preventDefault();
        });

        let usersPageLink = document.getElementById('UsersPageLink');
        linkElements.push(usersPageLink);
        usersPageLink.addEventListener('click', (e) => {

            new UsersPage().display();
            e.preventDefault();
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

    declare type LoadPageFn = (url: string) => boolean;
    declare const masterPageConfig: Pages.MasterPageConfig;

    function loadCurrentPage(): void {

        const functions = [

            HomePage.loadPage,
            TagsPage.loadPage,
            ThreadsPage.loadPage,
            ThreadMessagesPage.loadPage,
            UsersPage.loadPage
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