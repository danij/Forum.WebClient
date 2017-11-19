import {Pages} from './common';
import {ThreadRepository} from "../services/threadRepository";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {UserRepository} from "../services/userRepository";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadMessagesView} from "../views/threadMessagesView";

/**
 * Displays a list of thread messages with pagination and custom sorting
 */
export class ThreadMessagesPage implements Pages.Page {

    private pageNumber: number = 0;
    private sortOrder: string = 'ascending';

    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;

    private threadId: string = null;
    private thread: ThreadRepository.ThreadWithMessages = null;
    private threadMessageId: string = null;
    private userName: string = null;
    private user: UserRepository.User = null;

    display(): void {

        let jumpToId = '';

        Pages.changePage(async () => {

            if (this.threadMessageId && this.threadMessageId.length) {

                let rank = await ThreadMessageRepository.getThreadMessageRank(this.threadMessageId);
                this.threadId = rank.parentId;
                this.pageNumber = Math.floor(rank.rank / rank.pageSize);

                jumpToId = 'message-' + this.threadMessageId;
            }

            if (this.userName && this.userName.length) {

                this.user = await this.getCurrentUser();
            }
            else if (this.threadId && this.threadId.length) {

                this.thread = await this.getCurrentThread();
                if (null == this.thread) return;
            }

            this.refreshUrl();

            let messageCollection: ThreadMessageRepository.ThreadMessageCollection =
                this.thread
                    ? this.thread as ThreadMessageRepository.ThreadMessageCollection
                    : await this.getThreadMessagesOfUser(this.user);
            if (null == messageCollection) return;

            let elements = ThreadMessagesView.createThreadMessagesPageContent(messageCollection, {
                orderBy: 'created',
                sortOrder: this.sortOrder,
                thread: this.thread,
                user: this.user
            }, (value: number) => this.onPageNumberChange(value), this.thread);

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;

            return elements.list;

        }).then(() => {

            if (jumpToId) {

                Views.scrollContainerToId(jumpToId);
            }
        })
    }

    displayForThread(threadId: string): void {

        this.threadId = threadId;
        this.display();
    }

    displayForThreadMessage(threadMessageId: string): void {

        this.threadMessageId = threadMessageId;
        this.display();
    }

    displayForUser(userName: string): void {

        if (userName && userName.length) {

            this.userName = userName;
        }
        this.display();
    }

    static loadPage(url: string): boolean {

        if (url.indexOf('thread_messages/') != 0) return false;

        let page = new ThreadMessagesPage();

        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;
        page.threadId = Pages.getThreadId(url);
        page.threadMessageId = Pages.getThreadMessageId(url);
        page.userName = Pages.getUserName(url);

        page.display();
        return true;
    }

    private async getCurrentThread(): Promise<ThreadRepository.ThreadWithMessages> {

        return (await Pages.getOrShowError(ThreadRepository.getThreadById(this.threadId, {
            page: this.pageNumber,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest))).thread;
    }

    private getCurrentUser(): Promise<UserRepository.User> {

        return Pages.getOrShowError(UserRepository.getUserByName(this.userName));
    }

    private async getThreadMessagesOfUser(user: UserRepository.User): Promise<ThreadMessageRepository.ThreadMessageCollection> {

        return (await Pages.getOrShowError(ThreadMessageRepository.getThreadMessagesOfUser(this.user, {
            page: this.pageNumber,
            sort: this.sortOrder
        } as ThreadMessageRepository.GetThreadMessagesRequest)));
    }

    private refreshList(): void {

        Views.changeContent($('#pageContentContainer .thread-message-list')[0], async () => {

            let messageCollection: ThreadMessageRepository.ThreadMessageCollection =
                this.thread
                    ? await this.getCurrentThread()
                    : await this.getThreadMessagesOfUser(this.user);

            if (null == messageCollection) return;

            let newTopPaginationControl = Views.createPaginationControl(messageCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.topPaginationControl).replaceWith(newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(messageCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.bottomPaginationControl).replaceWith(newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadMessagesView.createThreadMessageList(messageCollection, this.thread);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let elements = $(controls);

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

        let url = 'thread_messages';
        let title = 'Thread Messages';
        let setActive = 'ThreadsPageLink';

        if (this.threadId && this.threadId.length) {

            url = Pages.getThreadMessagesOfThreadUrl(this.threadId, title = (this.thread ? this.thread.name : null) || title);
        }
        else if (this.userName && this.userName.length) {

            url = Pages.getThreadMessagesOfUserUrl(this.userName);
            title = 'Thread messages added by ' + this.userName;
            setActive = 'UsersPageLink';
        }

        MasterPage.goTo(Pages.appendToUrl(url, {
            sortOrder: this.sortOrder,
            pageNumber: this.pageNumber
        }), title);
        document.getElementById(setActive).classList.add('uk-active');
    }
}