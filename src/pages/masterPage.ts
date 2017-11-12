import {HomePage} from "./homePage";
import {TagsPage} from "./tagsPage";
import {ThreadsPage} from "./threadsPage";
import {UsersPage} from "./usersPage";

export module MasterPage {

    let originalTitle: string;
    let linkElements: HTMLElement[];

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

        loadCurrentPage();
    }

    export function goTo(url: string, title: string) {

        for (let link of linkElements) {

            link.classList.remove('uk-active');
        }

        window.history.pushState(null, getTitle(title), getUrl(url));
    }

    export function getTitle(extra: string): string {

        if (extra && extra.length) {

            return `${originalTitle} – ${extra}`;
        }
        return originalTitle;
    }

    export interface MasterPageConfig {

        baseUri: string
    }

    declare const masterPageConfig: MasterPageConfig;

    export function getUrl(relative: string): string {

        return `${masterPageConfig.baseUri}/${relative}`;
    }

    declare type LoadPageFn = (url: string) => boolean;

    function loadCurrentPage(): void {

        const functions = [

            HomePage.loadPage,
            TagsPage.loadPage,
            ThreadsPage.loadPage,
            UsersPage.loadPage
        ];

        let location = window.location.toString().toLowerCase();
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
}