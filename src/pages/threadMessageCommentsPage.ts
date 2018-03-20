import {Pages} from './common';
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {UserRepository} from "../services/userRepository";
import {Privileges} from "../services/privileges";
import {PageActions} from "./action";
import {DOMHelpers} from "../helpers/domHelpers";
import {ThreadMessagesView} from "../views/threadMessagesView";
import {ThreadMessageRepository} from "../services/threadMessageRepository";

/**
 * Displays a list of thread message comments with pagination and custom sorting
 */
export class ThreadMessageCommentsPage implements Pages.Page {

    private pageNumber: number = 0;
    private sortOrder: string = 'descending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private userName: string = null;
    private user: UserRepository.User = null;

    static readonly URL_PREFIX = 'thread_message_comments';

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            if (this.userName && this.userName.length) {

                this.user = await this.getUser(this.userName);
            }

            let commentsCollection = await this.getCommentsCollection();
            if (null == commentsCollection) return;

            let elements = ThreadMessagesView.createCommentsPageContent(commentsCollection, {
                    orderBy: null,
                    sortOrder: this.sortOrder,
                    user: this.user
                }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber),
                PageActions.getThreadMessageCallback(), Privileges.getThreadMessagePrivileges(),
                PageActions.getUserCallback(), Privileges.getUserPrivileges(),
                PageActions.getThreadCallback(), PageActions.getPrivilegesCallback());

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;

            return elements.list;
        });
    }

    displayForUser(userName: string): void {

        if (userName && userName.length) {

            this.userName = userName;
        }
        this.display();
    }

    static loadPage(url: string): boolean {

        if (url.indexOf(ThreadMessageCommentsPage.URL_PREFIX + '/') != 0) return false;

        let page = new ThreadMessageCommentsPage();

        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;
        page.userName = Pages.getUserName(url);

        page.display();
        return true;
    }

    private getCommentsCollection(): Promise<ThreadMessageRepository.ThreadMessageCommentCollection> {

        return this.user
            ? this.getCommentsWrittenByUser(this.user)
            : this.getAllComments();
    }

    private getAllComments(): Promise<ThreadMessageRepository.ThreadMessageCommentCollection> {

        return Pages.getOrShowError(ThreadMessageRepository.getAllThreadMessageComments({
            page: this.pageNumber,
            sort: this.sortOrder
        } as ThreadMessageRepository.GetThreadMessageCommentsRequest));
    }

    private getCommentsWrittenByUser(user: UserRepository.User): Promise<ThreadMessageRepository.ThreadMessageCommentCollection> {

        return Pages.getOrShowError(ThreadMessageRepository.getThreadMessageCommentsWrittenByUser(user, {
            page: this.pageNumber,
            sort: this.sortOrder
        } as ThreadMessageRepository.GetThreadMessageCommentsRequest));
    }

    private getUser(userName: string): Promise<UserRepository.User> {

        return Pages.getOrShowError(UserRepository.getUserByName(userName));
    }

    private refreshList(): void {

        Views.changeContent(document.querySelector('#pageContentContainer .thread-message-comments-list'), async () => {

            let commentsCollection = await this.getCommentsCollection();

            if (null == commentsCollection) return;

            let newTopPaginationControl = Views.createPaginationControl(commentsCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(commentsCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadMessagesView.createCommentsList(commentsCollection,
                PageActions.getThreadMessageCallback(), Privileges.getThreadMessagePrivileges(),
                PageActions.getThreadCallback(), this.user);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        if (controls) {

            let selectElements = controls.querySelectorAll("select[name='sortOrder']");

            for (let i = 0; i < selectElements.length; ++i) {

                selectElements[i].addEventListener('change', (ev) => {

                    this.sortOrder = (ev.target as HTMLSelectElement).value;
                    this.refreshUrl();
                    this.refreshList();
                });
            }
        }
    }

    private onPageNumberChange(newPageNumber: number): void {

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList();
    }

    private getLinkForPage(pageNumber: number): string {

        let url = ThreadMessageCommentsPage.URL_PREFIX;

        if (this.userName && this.userName.length) {

            url = Pages.getThreadMessageCommentsWrittenByUserUrl(this.userName);
        }

        return Pages.appendToUrl(url, {
            sortOrder: this.sortOrder,
            pageNumber: pageNumber
        });
    }

    private refreshUrl() {

        let title = 'Message Comments';

        if (this.userName && this.userName.length) {

            title = 'Message comments added by ' + this.userName;
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        document.getElementById('CommentsPageLink').classList.add('uk-active');
    }
}
