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
    private orderBy: string = 'latestmessagecreated';
    private sortOrder: string = 'descending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private tagName: string = null;
    private tag: TagRepository.Tag = null;
    private userName: string = null;
    private subscribedByUserName: string = null;
    private user: UserRepository.User = null;
    private subscribedByUser: UserRepository.User = null;

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            if (this.tagName && this.tagName.length) {

                this.tag = await this.getCurrentTag();
                if (null == this.tag) return;
            }
            else if (this.userName && this.userName.length) {

                this.user = await this.getUser(this.userName);
            }
            else if (this.subscribedByUserName && this.subscribedByUserName.length) {

                this.subscribedByUser = await this.getUser(this.subscribedByUserName);
            }

            const threadCollection = await this.getThreadCollection();
            if (null == threadCollection) return;

            const elements = ThreadsView.createThreadsPageContent(threadCollection, {
                    orderBy: this.orderBy,
                    sortOrder: this.sortOrder,
                    tag: this.tag,
                    user: this.user || this.subscribedByUser
                }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber),
                PageActions.getTagCallback(), PageActions.getUserCallback(), PageActions.getPrivilegesCallback());

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

    displaySubscribedByUser(userName: string): void {

        if (userName && userName.length) {

            this.subscribedByUserName = userName;
        }
        this.display();
    }

    static loadPage(url: string): boolean {

        if (url.indexOf('threads/') != 0) return false;

        const page = new ThreadsPage();

        page.orderBy = Pages.getOrderBy(url) || page.orderBy;
        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;
        page.tagName = Pages.getTagName(url);
        page.userName = Pages.getUserName(url);
        page.subscribedByUserName = Pages.getSubscribedByUserName(url);

        page.display();
        return true;
    }

    private getThreadCollection(): Promise<ThreadRepository.ThreadCollection> {

        return this.tag
            ? this.getThreadsWithTag(this.tag)
            : (this.user
                ? this.getThreadsOfUser(this.user)
                : (this.subscribedByUser
                    ? this.getSubscribedThreadsOfUser(this.subscribedByUser)
                    : this.getAllThreads()));
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

    private getSubscribedThreadsOfUser(user: UserRepository.User): Promise<ThreadRepository.ThreadCollection> {

        return Pages.getOrShowError(ThreadRepository.getSubscribedThreadsOfUser(user, {
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest));
    }

    private getCurrentTag(): Promise<TagRepository.Tag> {

        return Pages.getOrShowError(TagRepository.getTag(this.tagName));
    }

    private getUser(userName: string): Promise<UserRepository.User> {

        return Pages.getOrShowError(UserRepository.getUserByName(userName));
    }

    private refreshList(): void {

        Views.changeContent(document.querySelector('#page-content-container .threads-table'), async () => {

            const threadCollection = await this.getThreadCollection();

            if (null == threadCollection) return;

            const newTopPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadsView.createThreadsTable(threadCollection.threads);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        const radioElements = controls.querySelectorAll('input[type=radio]');

        DOMHelpers.forEach(radioElements, radioElement => {

            radioElement.addEventListener('change', (ev) => {

                this.orderBy = (ev.target as HTMLInputElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        });

        const selectElements = controls.querySelectorAll("select[name='sortOrder']");

        DOMHelpers.forEach(selectElements, selectElement => {

            selectElement.addEventListener('change', (ev) => {

                this.sortOrder = (ev.target as HTMLSelectElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        });
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
        else if (this.subscribedByUserName && this.subscribedByUserName.length) {

            url = Pages.getSubscribedThreadsOfUserUrl(this.subscribedByUserName);
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
        else if (this.subscribedByUserName && this.subscribedByUserName.length) {

            title = 'Threads subscribed to by ' + this.subscribedByUserName;
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        document.getElementById('threads-page-link').classList.add('uk-active');
    }
}
