import {Pages} from './common';
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "../views/threadsView";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {TagRepository} from "../services/tagRepository";
import {UserRepository} from "../services/userRepository";
import {Privileges} from "../services/privileges";
import {PageActions} from "./action";
import {DOMHelpers} from "../helpers/domHelpers";

/**
 * Displays a list of threads with pagination and custom sorting
 */
export class ThreadsPage implements Pages.Page {

    private pageNumber: number = 0;
    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private tagName: string = null;
    private tag: TagRepository.Tag = null;
    private userName: string = null;
    private user: UserRepository.User = null;

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            if (this.tagName && this.tagName.length) {

                this.tag = await this.getCurrentTag();
                if (null == this.tag) return;
            }
            else if (this.userName && this.userName.length) {

                this.user = await this.getCurrentUser();
            }

            let threadCollection = await (this.tag
                ? this.getThreadsWithTag(this.tag)
                : (this.user ? this.getThreadsOfUser(this.user) : this.getAllThreads()));
            if (null == threadCollection) return;

            let elements = ThreadsView.createThreadsPageContent(threadCollection, {
                orderBy: this.orderBy,
                sortOrder: this.sortOrder,
                tag: this.tag,
                user: this.user
            }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber),
                PageActions.getTagCallback(), Privileges.getTagPrivileges());

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;

            return elements.list;
        });
    }

    displayForTag(tagName: string): void {

        this.tagName = tagName;
        this.display();
    }

    displayForUser(userName: string): void {

        if (userName && userName.length) {

            this.userName = userName;
        }
        this.display();
    }

    static loadPage(url: string): boolean {

        if (url.indexOf('threads/') != 0) return false;

        let page = new ThreadsPage();

        page.orderBy = Pages.getOrderBy(url) || page.orderBy;
        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;
        page.tagName = Pages.getTagName(url);
        page.userName = Pages.getUserName(url);

        page.display();
        return true;
    }

    private getAllThreads(): Promise<ThreadRepository.ThreadCollection> {

        return Pages.getOrShowError(ThreadRepository.getThreads({
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest));
    }

    private getThreadsWithTag(tag: TagRepository.Tag): Promise<ThreadRepository.ThreadCollection> {

        return Pages.getOrShowError(ThreadRepository.getThreadsWithTag(tag, {
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest));
    }

    private getThreadsOfUser(user: UserRepository.User): Promise<ThreadRepository.ThreadCollection> {

        return Pages.getOrShowError(ThreadRepository.getThreadsOfUser(user, {
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest));
    }

    private getCurrentTag(): Promise<TagRepository.Tag> {

        return Pages.getOrShowError(TagRepository.getTag(this.tagName));
    }

    private getCurrentUser(): Promise<UserRepository.User> {

        return Pages.getOrShowError(UserRepository.getUserByName(this.userName));
    }

    private refreshList(): void {

        Views.changeContent(document.querySelector('#pageContentContainer .threads-table'), async () => {

            let threadCollection = await (this.tag
                ? this.getThreadsWithTag(this.tag)
                : (this.user ? this.getThreadsOfUser(this.user) : this.getAllThreads()));

            if (null == threadCollection) return;

            let newTopPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadsView.createThreadsTable(threadCollection.threads);
        }).then(() => {

            Views.scrollToTop();
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let radioElements = controls.querySelectorAll('input[type=radio]');

        for (let i = 0; i < radioElements.length; ++i) {

            radioElements[i].addEventListener('change', (ev) => {

                this.orderBy = (ev.target as HTMLInputElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        }

        let selectElements = controls.querySelectorAll("select[name='sortOrder']");

        for (let i = 0; i < selectElements.length; ++i) {

            selectElements[i].addEventListener('change', (ev) => {

                this.sortOrder = (ev.target as HTMLSelectElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        }
    }

    private onPageNumberChange(newPageNumber: number): void {

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList();
    }


    private getLinkForPage(pageNumber: number): string {

        let url = 'threads';

        if (this.tagName && this.tagName.length) {

            url = Pages.getThreadsWithTagUrlByName(this.tagName);
        }
        else if (this.userName && this.userName.length) {

            url = Pages.getThreadsOfUserUrl(this.userName);
        }

        return Pages.appendToUrl(url, {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: pageNumber
        });
    }

    private refreshUrl() {

        let title = 'Threads';

        if (this.tagName && this.tagName.length) {

            title = `Threads tagged with ${this.tagName}`;
        }
        else if (this.userName && this.userName.length) {

            title = 'Threads added by ' + this.userName;
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        document.getElementById('ThreadsPageLink').classList.add('uk-active');
    }
}
