import {HomePage} from './homePage';
import {TagsPage} from './tagsPage';
import {ThreadsPage} from './threadsPage';
import {UsersPage} from './usersPage';
import {Pages} from './common';
import {Views} from '../views/common';
import {ThreadsView} from '../views/threadsView';
import {ThreadMessagesView} from '../views/threadMessagesView';
import {ThreadMessagesPage} from './threadMessagesPage';
import {MasterView} from '../views/masterView';
import {ViewsExtra} from '../views/extra';
import {ThreadMessageCommentsPage} from './threadMessageCommentsPage';
import {Privileges} from '../services/privileges';
import {NewThreadPage} from './newThreadPage';
import {PageActions} from './action';
import {UsersView} from '../views/usersView';
import {DOMHelpers} from '../helpers/domHelpers';
import {PrivilegesView} from '../views/privilegesView';
import {ConsentView} from '../views/consentView';
import {LoginView} from '../views/loginView';
import {AuthenticationView} from '../views/authenticationView';
import {DocPage} from './docPage';

export module MasterPage {

    let originalTitle: string;
    let linkElements: HTMLElement[];
    let goBackInProgress: boolean = false;

    export async function bootstrap(): Promise<void> {

        MasterView.loadFavoriteTheme();

        MasterView.applyPageConfig(masterPageConfig, PageActions.getDocumentationCallback());

        originalTitle = document.title;

        ConsentView.init();

        AuthenticationView.checkAuthentication(PageActions.getAuthCallback(), PageActions.getUserCallback(),
            PageActions.getPrivateMessageCallback());

        setupLinks();

        const loadForumWidePrivilegesPromise = Privileges.ForumWide.loadForumWidePrivileges();

        setupSearch();

        ViewsExtra.init();

        window.onpopstate = () => onGoBack();

        setupUpdates();
        setupRecentModals();
        setupSettings();

        await loadForumWidePrivilegesPromise;
        afterGettingForumWidePrivileges();
        loadCurrentPage();

        MasterView.setupThemeSelector();
    }

    function setupLinks() : void {

        const pages = [

            {linkId: 'home-page-link', factory: () => new HomePage()},
            {linkId: 'tags-page-link', factory: () => new TagsPage()},
            {linkId: 'threads-page-link', factory: () => new ThreadsPage()},
            {linkId: 'users-page-link', factory: () => new UsersPage()},
            {linkId: 'comments-page-link', factory: () => new ThreadMessageCommentsPage()},
            {linkId: 'new-thread-page-link', factory: () => new NewThreadPage()},
        ];

        linkElements = pages.map((page) => {

            const link = document.getElementById(page.linkId);
            Views.onClick(link, () => {

                page.factory().display();
            });

            const linkElement = link.getElementsByTagName('a')[0] as HTMLAnchorElement;
            const href = linkElement.getAttribute('data-href');
            linkElement.href = Pages.getUrl(href);

            return link;
        });

        LoginView.setupLogin(PageActions.getAuthCallback(), PageActions.getDocumentationCallback());
    }

    function afterGettingForumWidePrivileges() : void {

        if (Privileges.ForumWide.canViewAllComments()) {

            DOMHelpers.unHide(document.getElementById('comments-page-link'));
        }

        if (Privileges.ForumWide.canViewForumWideRequiredPrivileges() || Privileges.ForumWide.canViewForumWideAssignedPrivileges()) {

            DOMHelpers.unHide(document.getElementById('forum-wide-privileges-link'));
        }

        if (Privileges.ForumWide.canAddNewThread()) {

            DOMHelpers.unHide(document.getElementById('new-thread-page-link'));
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

            DOMHelpers.removeClasses(link, 'uk-active');
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
            ThreadMessageCommentsPage.loadPage,
            DocPage.loadPage
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
        location = location.split('#')[0];

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
        setInterval(
            () => AuthenticationView.checkAuthentication(PageActions.getAuthCallback(),
                PageActions.getUserCallback(), PageActions.getPrivateMessageCallback()),
            Views.DisplayConfig.checkAuthenticationEveryMilliSeconds);
    }

    function setupRecentModals(): void {

        MasterView.setupRecentModal();
    }

    function updateStatistics(): void {

        MasterView.updateStatistics();
    }

    function setupSearch(): void {

        const searchLink = document.getElementById('show-search-modal');
        Views.onClick(searchLink, () => {

            const modal = document.getElementById('search-modal');
            Views.showModal(modal);

            const searchInput = DOMHelpers.removeEventListeners(
                document.getElementById('searchInput') as HTMLInputElement);
            searchInput.focus();

            const searchButton = DOMHelpers.removeEventListeners(
                document.getElementById('searchButton'));

            const searchFn = () => {

                const input = searchInput.value;
                if (input.trim().length < 1) return;

                const checkedSearchType = modal.querySelectorAll('input[name=searchFor]:checked');
                if (checkedSearchType.length < 1) return;

                const resultsContainer = modal.getElementsByClassName('search-results-container')[0] as HTMLElement;

                switch ((checkedSearchType[0] as HTMLInputElement).value) {

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
            };

            searchInput.addEventListener('keypress', (ev) => {

                if (13 == ev.keyCode) {

                    ev.preventDefault();
                    searchFn();
                }
            });

            Views.onClick(searchButton, () => {

                searchFn();
            });
        });
    }

    function searchUser(toSearch: string, resultsContainer: HTMLElement): void {

        Views.changeContent(resultsContainer, async () => {

            const users = await PageActions.getUserCallback().searchUsersByName(toSearch);

            const result = DOMHelpers.parseHTML('<div class="users-list"></div>');
            result.appendChild(UsersView.createUserListContent(users));

            return result;
        });
    }

    async function searchThread(toSearch: string, resultsContainer: HTMLElement): Promise<void> {

        await Views.changeContent(resultsContainer, async () => {

            const threads = await PageActions.getThreadCallback().searchThreadsByName(toSearch);

            const result = DOMHelpers.parseHTML('<div class="threads-table"></div>');
            result.appendChild(ThreadsView.createThreadsTable(threads));

            return result;
        });
        ViewsExtra.refreshMath(resultsContainer);
    }

    async function searchThreadMessage(toSearch: string, resultsContainer: HTMLElement): Promise<void> {

        await Views.changeContent(resultsContainer, async () => {

            const messages = await PageActions.getThreadMessageCallback().searchThreadMessagesByName(toSearch);

            return await ThreadMessagesView.createThreadMessageList(messages,
                PageActions.getThreadMessageCallback(), PageActions.getThreadCallback(),
                PageActions.getPrivilegesCallback());
        });
        ViewsExtra.refreshMath(resultsContainer);
    }

    function setupSettings() {

        Views.onClick(document.getElementById('settings'), () => {

            PrivilegesView.showForumWidePrivileges(PageActions.getPrivilegesCallback());
        })
    }
}