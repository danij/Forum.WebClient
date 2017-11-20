import {Pages} from './common';
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "../views/threadsView";
import {CommonEntities} from "../services/commonEntities";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {TagRepository} from "../services/tagRepository";
import {UserRepository} from "../services/userRepository";

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
            }, (value: number) => this.onPageNumberChange(value));

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

        Views.changeContent($('#pageContentContainer .threads-table')[0], async () => {

            let threadCollection = await (this.tag
                ? this.getThreadsWithTag(this.tag)
                : (this.user ? this.getThreadsOfUser(this.user) : this.getAllThreads()));

            if (null == threadCollection) return;

            let newTopPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.topPaginationControl).replaceWith(newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.bottomPaginationControl).replaceWith(newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadsView.createThreadsTable(threadCollection.threads);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let elements = $(controls);

        elements.find('input[type=radio]').on('change', (e) => {

            this.orderBy = (e.target as HTMLInputElement).value;
            this.refreshUrl();
            this.refreshList();
        });

        elements.find("select[name='sortOrder']").on('change', (e) => {

            this.sortOrder = (e.target as HTMLSelectElement).value;
            this.refreshUrl();
            this.refreshList();
        });
    }

    private onPageNumberChange(newPageNumber: number): void {

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList();
    }

    private refreshUrl() {

        let url = 'threads';
        let title = 'Threads';

        if (this.tagName && this.tagName.length) {

            url = Pages.getThreadsWithTagUrlByName(this.tagName);
            title = `Threads tagged with ${this.tagName}`;
        }
        else if (this.userName && this.userName.length) {

            url = Pages.getThreadsOfUserUrl(this.userName);
            title = 'Threads added by ' + this.userName;
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(Pages.appendToUrl(url, {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: this.pageNumber
        }), title);
        document.getElementById('ThreadsPageLink').classList.add('uk-active');
    }
}
