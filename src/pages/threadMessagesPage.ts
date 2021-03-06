import {Pages} from './common';
import {ThreadRepository} from '../services/threadRepository';
import {Views} from '../views/common';
import {MasterPage} from './masterPage';
import {UserRepository} from '../services/userRepository';
import {ThreadMessageRepository} from '../services/threadMessageRepository';
import {ThreadMessagesView} from '../views/threadMessagesView';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';
import {EditViews} from '../views/edit';
import {LanguageService} from "../services/languageService";
import L = LanguageService.translate;

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

                this.user = await Pages.getUser(this.userName);
            }
            else if (this.threadId && this.threadId.length) {

                this.thread = await this.getCurrentThread();
                if (null == this.thread) {

                    Views.showDangerNotification(L('Thread not found'));
                    return;
                }
            }

            this.refreshUrl();

            const messageCollection: ThreadMessageRepository.ThreadMessageCollection =
                this.thread
                    ? this.thread as ThreadMessageRepository.ThreadMessageCollection
                    : await this.getThreadMessagesOfUser();
            if (null == messageCollection) return;

            const elements = await ThreadMessagesView.createThreadMessagesPageContent(messageCollection, {
                orderBy: 'created',
                sortOrder: this.sortOrder,
                thread: this.thread,
                user: this.user
            }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber), this.thread,
                PageActions.getThreadCallback(), PageActions.getThreadMessageCallback(),
                PageActions.getTagCallback(), PageActions.getUserCallback(), PageActions.getAttachmentCallback(),
                PageActions.getPrivilegesCallback(), this.thread ? (message) => this.quoteCallback(message) : null);

            Pages.setupSortControls(this, elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;
            this.editControl = elements.editControl;

            return elements.list;

        }).then(() => {

            setTimeout(() => {
                if (jumpToId) {

                    Views.scrollContainerTo(document.getElementById(jumpToId));
                } else {

                    Views.scrollContainerTo(document.getElementsByClassName('page-content')[0].children[0] as HTMLElement);
                }
            }, 100);
        })
    }

    private quoteCallback(message: ThreadMessageRepository.ThreadMessage): void {

        if (this.editControl && message) {

            this.editControl.insertQuote(message);
        }
    }

    displayForThread(threadId: string, page?: number): void {

        this.threadId = threadId;
        if (page > 0) {

            this.pageNumber = page;
        }
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

        if ((url.indexOf('thread_message/') != 0)
            && (url.indexOf('thread_messages/') != 0)
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

    private async getThreadMessagesOfUser(): Promise<ThreadMessageRepository.ThreadMessageCollection> {

        return (await Pages.getOrShowError(ThreadMessageRepository.getThreadMessagesOfUser(this.user, {
            page: this.pageNumber,
            sort: this.sortOrder
        } as ThreadMessageRepository.GetThreadMessagesRequest)));
    }

    private async refreshList(scrollDirection: Pages.ScrollDirection): Promise<void> {

        await Views.changeContent(document.querySelector('#page-content-container .thread-message-list'), async () => {

            const messageCollection: ThreadMessageRepository.ThreadMessageCollection =
                this.thread
                    ? await this.getCurrentThread()
                    : await this.getThreadMessagesOfUser();

            if (null == messageCollection) return;

            const newTopPaginationControl = Views.createPaginationControl(messageCollection, L('messages'),
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));

            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(messageCollection, L('messages'),
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return await ThreadMessagesView.createThreadMessageList(messageCollection,
                PageActions.getThreadMessageCallback(), PageActions.getThreadCallback(),
                PageActions.getAttachmentCallback(), PageActions.getPrivilegesCallback(),
                this.thread, (message) => this.quoteCallback(message));
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

        let url = 'thread_messages';
        const title = L('Thread Messages');

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

        let title = L('Thread Messages');
        let setActive = 'threads-page-link';

        if (this.threadId && this.threadId.length) {

            title = (this.thread ? this.thread.name : null) || title;
        }
        else if (this.userName && this.userName.length) {

            title = L('THREAD_MESSAGES_BY', this.userName);
            setActive = 'users-page-link';
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        DOMHelpers.addClasses(document.getElementById(setActive), 'uk-active');
    }
}
