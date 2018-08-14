import {Pages} from './common';
import {ThreadRepository} from "../services/threadRepository";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {UserRepository} from "../services/userRepository";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadMessagesView} from "../views/threadMessagesView";
import {Privileges} from "../services/privileges";
import {PageActions} from "./action";
import {DOMHelpers} from "../helpers/domHelpers";
import {EditViews} from "../views/edit";

/**
 * Displays a list of thread messages with pagination and custom sorting
 */
export class ThreadMessagesPage implements Pages.Page {

    private pageNumber: number = 0;
    private readonly defaultSortOrder: string = 'ascending';
    private sortOrder: string = this.defaultSortOrder;

    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private editControl: EditViews.EditControl;

    private threadId: string = null;
    private thread: ThreadRepository.ThreadWithMessages = null;
    private threadMessageId: string = null;
    private userName: string = null;
    private user: UserRepository.User = null;

    display(): void {

        let jumpToId = '';

        Pages.changePage(async () => {

            if (this.threadMessageId && this.threadMessageId.length) {

                const rank = await ThreadMessageRepository.getThreadMessageRank(this.threadMessageId);
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

            const messageCollection: ThreadMessageRepository.ThreadMessageCollection =
                this.thread
                    ? this.thread as ThreadMessageRepository.ThreadMessageCollection
                    : await this.getThreadMessagesOfUser();
            if (null == messageCollection) return;

            const elements = ThreadMessagesView.createThreadMessagesPageContent(messageCollection, {
                orderBy: 'created',
                sortOrder: this.sortOrder,
                thread: this.thread,
                user: this.user
            }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber), this.thread,
                PageActions.getThreadCallback(), PageActions.getThreadMessageCallback(),
                PageActions.getUserCallback(), PageActions.getPrivilegesCallback(),
                this.thread ? (message) => this.quoteCallback(message) : null);

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;
            this.editControl = elements.editControl;

            return elements.list;

        }).then(() => {

            if (jumpToId) {

                Views.scrollContainerToId(jumpToId);
            }
        })
    }

    private quoteCallback(message: ThreadMessageRepository.ThreadMessage): void {

        if (this.editControl && message) {

            this.editControl.insertQuote(message);
        }
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

        if ((url.indexOf('thread_messages/') != 0)
            && (url.indexOf('thread/') != 0)) return false;

        const page = new ThreadMessagesPage();
        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;
        page.threadId = Pages.getThreadId('/' + url);
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

    private async getThreadMessagesOfUser(): Promise<ThreadMessageRepository.ThreadMessageCollection> {

        return (await Pages.getOrShowError(ThreadMessageRepository.getThreadMessagesOfUser(this.user, {
            page: this.pageNumber,
            sort: this.sortOrder
        } as ThreadMessageRepository.GetThreadMessagesRequest)));
    }

    private refreshList(): void {

        Views.changeContent(document.querySelector('#pageContentContainer .thread-message-list'), async () => {

            const messageCollection: ThreadMessageRepository.ThreadMessageCollection =
                this.thread
                    ? await this.getCurrentThread()
                    : await this.getThreadMessagesOfUser();

            if (null == messageCollection) return;

            const newTopPaginationControl = Views.createPaginationControl(messageCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));

            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(messageCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadMessagesView.createThreadMessageList(messageCollection,
                PageActions.getThreadMessageCallback(), PageActions.getThreadCallback(),
                PageActions.getPrivilegesCallback(), this.thread, (message) => this.quoteCallback(message));
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        if (controls) {

            const elements = controls.querySelectorAll("select[name='sortOrder']");

            for (let i = 0; i < elements.length; ++i) {

                elements[i].addEventListener('change', (ev) => {

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

        let url = 'thread_messages';
        const title = 'Thread Messages';

        if (this.threadId && this.threadId.length) {

            url = Pages.getThreadMessagesOfThreadUrl(this.threadId, (this.thread ? this.thread.name : null) || title);
        }
        else if (this.userName && this.userName.length) {

            url = Pages.getThreadMessagesOfUserUrl(this.userName);
        }

        return Pages.appendToUrl(url, {
            sortOrder: (this.sortOrder != this.defaultSortOrder) ? this.sortOrder : null,
            pageNumber: (pageNumber != 0) ? pageNumber : null
        });
    }

    private refreshUrl() {

        let title = 'Thread Messages';
        let setActive = 'ThreadsPageLink';

        if (this.threadId && this.threadId.length) {

            title = (this.thread ? this.thread.name : null) || title;
        }
        else if (this.userName && this.userName.length) {

            title = 'Thread messages added by ' + this.userName;
            setActive = 'UsersPageLink';
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        document.getElementById(setActive).classList.add('uk-active');
    }
}
