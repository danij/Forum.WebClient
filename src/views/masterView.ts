import {StatisticsRepository} from '../services/statisticsRepository';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {Views} from './common';
import {UsersView} from './usersView';
import {UserRepository} from '../services/userRepository';
import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {DocumentationView} from './documentationView';
import {ThreadRepository} from '../services/threadRepository';
import {ThreadsView} from './threadsView';
import {ViewsExtra} from './extra';
import {ThreadMessageRepository} from '../services/threadMessageRepository';
import {ThreadMessagesView} from './threadMessagesView';
import {ScrollSpy} from './scrollSpy';
import {DocPage} from '../pages/docPage';
import {PageActions} from '../pages/action';
import {ThemeRepository} from "../services/themeRepository";
import {LanguageRepository} from "../services/languageRepository";
import {LanguageService} from "../services/languageService";

export module MasterView {

    import cE = DOMHelpers.cE;
    import IDocumentationCallback = PageActions.IDocumentationCallback;
    import L = LanguageService.translate;
    const FooterSeparator = ' · ';

    export function applyPageConfig(config: Pages.MasterPageConfig, docCallback: IDocumentationCallback) {

        document.title = config.title;

        const subNavLinks = document.getElementById('subnav-links');

        for (let subNavLink of config.navLinks || []) {

            subNavLinks.appendChild(createNavLink(subNavLink, docCallback));
        }

        setTimeout(() => {
            //wait for renderer to load
            const newsItems = document.getElementById('news');
            for (let newsItem of config.newsItems || []) {

                const item = cE("li");
                let newsText: string;
                if ('string' == typeof (newsItem)) {
                    newsText = newsItem;
                } else {
                    const currentLanguage = LanguageService.getCurrentLanguage();
                    if ( ! (currentLanguage in newsItem)) continue;
                    newsText = newsItem[currentLanguage];
                }

                item.innerHTML = DOMHelpers.parseHTML(ViewsExtra.expandContent(newsText)).innerHTML;
                newsItems.appendChild(item);
            }
            ViewsExtra.refreshMath(newsItems);
        }, 0);
    }

    function createNavLink(link: Pages.PageLink, docCallback: IDocumentationCallback): HTMLLIElement {

        const linkElement = cE('a') as HTMLAnchorElement;

        if (link.link) {

            linkElement.setAttribute('href', link.link);
            DOMHelpers.addRelAttribute(linkElement);
        } else if (link.docName) {

            linkElement.href = DocPage.getPageUrl(link.docName);
            Views.onClick(linkElement, () => DocumentationView.showDocumentationInModal(link.docName, docCallback));
        }
        let linkTitle: string;
        if ('string' == typeof (link.title)) {
            linkTitle = link.title;
        } else {
            const currentLanguage = LanguageService.getCurrentLanguage();
            if (currentLanguage in link.title) {
                linkTitle = link.title[currentLanguage];
            } else {
                linkTitle = '<Unknown>';
            }
        }
        linkElement.innerText = linkTitle;

        const result = cE('li') as HTMLLIElement;
        result.appendChild(linkElement);

        return result;
    }

    function getStatisticsRaw(statistics: StatisticsRepository.EntityCount): string {

        const values = [
            ['users', 'USERS', DisplayHelpers.intToString(statistics.users)],
            ['list', 'THREADS', DisplayHelpers.intToString(statistics.discussionThreads)],
            ['mail', 'THREAD_MESSAGES', DisplayHelpers.intToString(statistics.discussionMessages)],
            ['tag', 'TAGS', DisplayHelpers.intToString(statistics.discussionTags)],
            ['home', 'CATEGORIES', DisplayHelpers.intToString(statistics.discussionCategories)],
        ];
        return values.map(t => `${t[2]} <span uk-icon="${t[0]}" title="${L(t[1])}"></span>`).join('&emsp;');
    }

    function showOnlineUsers(link: HTMLAnchorElement, users: UserRepository.User[]) {

        link.innerText = '';
        link = DOMHelpers.removeEventListeners(link);

        link.innerText = L('USERS_ONLINE', DisplayHelpers.intToString(users.length));

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
            span.innerHTML = getStatisticsRaw(value);

            Views.processUIkitElements(span);

            const visitorsStatistics = document.getElementById('visitors-statistics');
            visitorsStatistics.innerText = L('VISITORS_COUNT', DisplayHelpers.intToString(value.visitors));
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

    function removeRecentPageParts(className: string): void {

        let i = 0;
        DOMHelpers.forEach(document.getElementsByClassName(className), element => {

            if (0 < i++) {

                element.parentElement.removeChild(element);
            }
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

    function closeRecentThreadsPage(): void {

        removeRecentPageParts('recent-threads-content');
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

    function closeRecentThreadMessagesPage(): void {

        removeRecentPageParts('recent-messages-content');
    }

    export function showRecentThreadsModal(): void {

        const recentThreadsModal = document.getElementById('recent-threads-modal');
        updateRecentThreads();

        const dialog = recentThreadsModal.getElementsByClassName('uk-modal-dialog')[0] as HTMLElement;
        ScrollSpy.enableScrollSpy(dialog, loadNewRecentThreadsPage, closeRecentThreadsPage);

        Views.showModal(recentThreadsModal);
    }

    export function showRecentThreadMessagesModal(): void {

        const recentThreadMessagesModal = document.getElementById('recent-thread-messages-modal');
        updateRecentThreadMessages();

        const dialog = recentThreadMessagesModal.getElementsByClassName('uk-modal-dialog')[0] as HTMLElement;
        ScrollSpy.enableScrollSpy(dialog, loadNewRecentThreadMessagesPage, closeRecentThreadMessagesPage);

        Views.showModal(recentThreadMessagesModal);
    }

    export function setupRecentModal(): void {

        const recentThreadsModalLink = document.getElementById('recent-threads-modal-link');
        Views.onClick(recentThreadsModalLink, showRecentThreadsModal);

        const recentThreadMessagesModalLink = document.getElementById('recent-thread-messages-modal-link');
        Views.onClick(recentThreadMessagesModalLink, showRecentThreadMessagesModal);
    }

    export function showVoteHistoryModal(): void {

        const modal = document.getElementById('vote-history-modal');

        updateRecentPage('received-votes-content', async (page) => {

            const receivedVoteHistory = await UserRepository.getReceivedVotesHistory();

            return ThreadMessagesView.createReceivedVotesView(receivedVoteHistory);

        }, 0);

        Views.showModal(modal);
    }

    export function showQuoteHistoryModal(): void {

        const modal = document.getElementById('quote-history-modal');

        updateRecentPage('quoted-messages-content', async (page) => {

            const receivedQuotesHistory = await UserRepository.getQuotedHistory();

            return ThreadMessagesView.createRecentThreadMessagesView(receivedQuotesHistory.messages);

        }, 0);

        Views.showModal(modal);
    }

    export function loadFavoriteTheme(): void {

        const theme = ThemeRepository.getFavoriteTheme();
        let themeIsValid = false;

        const selectElement = document.getElementById('theme-select') as HTMLSelectElement;

        DOMHelpers.forEach(selectElement.options, (option: HTMLOptionElement) => {

            themeIsValid = themeIsValid || (theme.toLowerCase() === option.value.toLowerCase());
        });

        if (themeIsValid) {

            selectElement.value = theme;
            changeTheme(theme);
        }
    }

    function changeTheme(theme: string): void {

        const linkElement = document.getElementById('theme-link') as HTMLLinkElement;

        linkElement.href = `/${DOMHelpers.escapeStringForAttribute(theme)}Theme.css`;
    }

    export function setupThemeSelector(): void {

        const selectElement = document.getElementById('theme-select') as HTMLSelectElement;
        selectElement.onchange = (ev) => {

            const selectedTheme = selectElement.value;

            changeTheme(selectedTheme);
            ThemeRepository.saveFavoriteTheme(selectedTheme);
        };
    }

    export function loadLanguage(): void {

        const language = LanguageRepository.getLanguage();

        const selectElement = document.getElementById('language-select') as HTMLSelectElement;
        selectElement.value = language;
        LanguageService.setLanguage(language);
    }

    export function setupLanguageSelector(): void {

        const selectElement = document.getElementById('language-select') as HTMLSelectElement;
        selectElement.onchange = (ev) => {

            const selectedLanguage = selectElement.value;

            LanguageRepository.saveLanguage(selectedLanguage);
            location.reload();
        };
    }
}