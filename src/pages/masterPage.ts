import {HomePage} from "./homePage";
import {TagsPage} from "./tagsPage";
import {ThreadsPage} from "./threadsPage";
import {UsersPage} from "./usersPage";
import {Pages} from "./common";
import {Views} from "../views/common";
import {StatisticsRepository} from "../services/statisticsRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";

export module MasterPage {

    let originalTitle: string;
    let linkElements: HTMLElement[];
    let goBackInProgress: boolean = false;

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
    }

    function updateStatistics(): void {

        StatisticsRepository.getEntityCount().then(value => {

            let span = document.getElementById('entityCount');
            const values = [
                DisplayHelpers.intToString(value.users),
                DisplayHelpers.intToString(value.discussionThreads),
                DisplayHelpers.intToString(value.discussionMessages),
                DisplayHelpers.intToString(value.discussionTags),
                DisplayHelpers.intToString(value.discussionCategories),
            ];
            span.innerText = `· ${values[0]} users · ${values[1]} threads · ${values[2]} thread messages · ${values[3]} tags · ${values[4]} categories`;
        });
    }
}