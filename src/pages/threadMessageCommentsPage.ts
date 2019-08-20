import {Pages} from './common';
import {Views} from '../views/common';
import {MasterPage} from './masterPage';
import {UserRepository} from '../services/userRepository';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';
import {ThreadMessagesView} from '../views/threadMessagesView';
import {ThreadMessageRepository} from '../services/threadMessageRepository';
import {LanguageService} from "../services/languageService";
import L = LanguageService.translate;

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

                this.user = await Pages.getUser(this.userName);
            }

            const commentsCollection = await this.getCommentsCollection();
            if (null == commentsCollection) return;

            const elements = await ThreadMessagesView.createCommentsPageContent(commentsCollection, {
                    orderBy: null,
                    sortOrder: this.sortOrder,
                    user: this.user
                }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber),
                PageActions.getThreadMessageCallback(), PageActions.getUserCallback(),
                PageActions.getThreadCallback(), PageActions.getAttachmentCallback(), PageActions.getPrivilegesCallback());

            Pages.setupSortControls(this, elements.sortControls);

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

        const page = new ThreadMessageCommentsPage();

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

    private async refreshList(scrollDirection: Pages.ScrollDirection): Promise<void> {

        Views.changeContent(document.querySelector('#page-content-container .thread-message-comments-list'), async () => {

            const commentsCollection = await this.getCommentsCollection();

            if (null == commentsCollection) return;

            const newTopPaginationControl = Views.createPaginationControl(commentsCollection, L('message comments'),
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(commentsCollection, L('message comments'),
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return await ThreadMessagesView.createCommentsList(commentsCollection,
                PageActions.getThreadMessageCallback(), PageActions.getThreadCallback(),
                PageActions.getAttachmentCallback(), PageActions.getPrivilegesCallback(), this.user);
        });

        Pages.scrollPage(scrollDirection);
    }

    private onPageNumberChange(newPageNumber: number): void {

        const scrollDirection = Pages.getScrollDirection(newPageNumber, this.pageNumber);

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList(scrollDirection);
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

        let title = L('Message Comments');

        if (this.userName && this.userName.length) {

            title = L('MESSAGE_COMMENTS_BY', this.userName);
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
    }
}
