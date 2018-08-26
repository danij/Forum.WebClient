import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {Views} from "./common";
import {ThreadRepository} from "../services/threadRepository";
import {UserRepository} from "../services/userRepository";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {ViewsExtra} from "./extra";
import {Privileges} from "../services/privileges";
import {PageActions} from "../pages/action";
import {EditViews} from "./edit";
import {ThreadMessagesPage} from "../pages/threadMessagesPage";
import {ThreadsView} from "./threadsView";
import {CommonEntities} from "../services/commonEntities";
import {PrivilegesView} from "./privilegesView";

export module ThreadMessagesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;

    export class ThreadMessagesPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement;
        editControl: EditViews.EditControl;
    }

    export class ThreadMessageCommentsPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement;
    }

    export interface ThreadMessagePageDisplayInfo extends Views.SortInfo {

        thread?: ThreadRepository.ThreadWithMessages,
        user?: UserRepository.User
    }

    interface MessageEditControl {

        element: HTMLElement;
        editControl: EditViews.EditControl;
    }

    export interface CommentsPageDisplayInfo extends Views.SortInfo {

        user?: UserRepository.User
    }

    export function createRecentThreadMessagesView(messages: ThreadMessageRepository.ThreadMessage[]): HTMLElement {

        const result = dA('<div>');

        for (let message of messages) {

            if (null === message) continue;

            const element = dA('<div class="recent-message">');
            result.append(element);

            element.append(createMessageShortView(message, false));
        }

        const resultElement = result.toElement();

        DOMHelpers.forEach(resultElement.getElementsByClassName('recent-message-thread-link'), link => {

            DOMHelpers.addClasses(link, 'render-math');
            ViewsExtra.refreshMath(link);
        });
        DOMHelpers.forEach(resultElement.getElementsByClassName('recent-message-link'), link => {

            ViewsExtra.expandAndAdjust(link, link.title);
            DOMHelpers.addClasses(link, 'render-math');
            ViewsExtra.refreshMath(link);
        });

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupSubscribedThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);

        return resultElement;
    }

    export function createThreadMessagesPageContent(collection: ThreadMessageRepository.ThreadMessageCollection,
                                                    info: ThreadMessagePageDisplayInfo,
                                                    onPageNumberChange: Views.PageNumberChangeCallback,
                                                    getLinkForPage: Views.GetLinkForPageCallback,
                                                    thread: ThreadRepository.Thread,
                                                    threadCallback: PageActions.IThreadCallback,
                                                    threadMessageCallback: PageActions.IThreadMessageCallback,
                                                    userCallback: PageActions.IUserCallback,
                                                    privilegesCallback: PageActions.IPrivilegesCallback,
                                                    quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): ThreadMessagesPageContent {

        collection = collection || ThreadMessageRepository.defaultThreadMessageCollection();

        const result = new ThreadMessagesPageContent();

        const resultList = cE('div');

        if (info.thread) {

            resultList.appendChild(ThreadsView.createThreadPageHeader(info.thread, threadCallback, privilegesCallback));
        }
        else if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, privilegesCallback));
            resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));
        }

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, 'thread messages', onPageNumberChange, getLinkForPage));

        const editControl = thread ? createNewThreadMessageControl(thread, threadCallback) : null;

        const listContainer = cE('div');
        DOMHelpers.addClasses(listContainer, 'thread-message-list');
        listContainer.appendChild(createThreadMessageList(collection, threadMessageCallback, threadCallback,
            privilegesCallback, thread, quoteCallback));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, 'thread messages', onPageNumberChange, getLinkForPage));

        if (editControl) {

            resultList.appendChild(editControl.element);
            result.editControl = editControl.editControl;
        }

        result.list = resultList;

        return result;
    }

    function createThreadMessageListSortControls(info: Views.SortInfo): HTMLElement {

        return DOMHelpers.parseHTML('<div class="thread-messages-list-header uk-flex uk-flex-center">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            Views.createSortOrderOption('ascending', 'Ascending', info) +
            Views.createSortOrderOption('descending', 'Descending', info) +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>');
    }

    export function createThreadMessageList(collection: ThreadMessageRepository.ThreadMessageCollection,
                                            callback: PageActions.IThreadMessageCallback,
                                            threadCallback: PageActions.IThreadCallback,
                                            privilegesCallback: PageActions.IPrivilegesCallback,
                                            thread?: ThreadRepository.Thread,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): HTMLElement {

        const messages = collection.messages || [];

        const result = dA('<div class="uk-container uk-container-expand">');

        if (messages.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No messages found</span>');
            return result.toElement();
        }

        const messagesById = {};

        for (let i = 0; i < messages.length; ++i) {

            const message = messages[i];
            messagesById[message.id] = message;

            const messageContainer = dA('<div class="uk-card uk-card-body discussion-thread-message">');
            result.append(messageContainer);

            const showParentThreadName = !!(message.receivedParentThread && message.parentThread.name
                && message.parentThread.name.length);

            createThreadMessageHeader(messageContainer, message, collection, i, showParentThreadName);
            messageContainer.append(createThreadMessageDetails(message, showParentThreadName));
            messageContainer.append(createThreadMessageAuthor(message, thread));
            messageContainer.append(createThreadMessageActionLinks(message, quoteCallback));
            messageContainer.append(createThreadMessageContent(message));

            if (i < (messages.length - 1)) {

                result.appendRaw('<hr class="uk-divider-icon" />');
            }
        }

        const element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);

        setupThreadMessageActionEvents(element, messagesById, callback, threadCallback, privilegesCallback,
            quoteCallback);

        return element;
    }

    function createThreadMessageHeader(messageContainer: DOMAppender, message: ThreadMessageRepository.ThreadMessage,
                                       collection: CommonEntities.PaginationInfo, i: number, showParentThreadName: boolean): void {

        if (showParentThreadName) {

            const href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
            const data = `data-threadmessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
            const id = DOMHelpers.escapeStringForAttribute('message-' + message.id);

            const link = dA(`<a id="${id}" href="${href}" ${data}>`);
            link.appendString(message.parentThread.name);

            const container = dA('<div class="message-parent-thread render-math uk-card-badge">');
            container.append(link);
            messageContainer.append(container);
        }
        else {

            const number = collection.page * collection.pageSize + i + 1;
            const href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
            const data = `data-threadmessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
            const id = DOMHelpers.escapeStringForAttribute('message-' + message.id);
            messageContainer.appendRaw(`<div class="message-number uk-text-meta"><a id="${id}" href="${href}" ${data}>#${DisplayHelpers.intToString(number)}</a></div>`);
        }
    }

    function createThreadMessageDetails(message: ThreadMessageRepository.ThreadMessage, showParentThreadName: boolean) {

        const extraClass = showParentThreadName ? 'right' : '';
        const messageDetailsContainer = dA(`<div class="uk-card-badge message-time-container ${extraClass}">`);
        messageDetailsContainer.appendRaw(`<span class="message-time">${DisplayHelpers.getDateTime(message.created)} </span>`);

        if (message.lastUpdated && message.lastUpdated.at) {

            let reason = (message.lastUpdated.reason || '').trim();
            if (reason.length < 1) {
                reason = '<no reason>';
            }
            const title = message.lastUpdated.userName + ': ' + reason;

            messageDetailsContainer.appendRaw(`<span class="message-time uk-text-warning" title="${DOMHelpers.escapeStringForAttribute(title)}">Edited ${DisplayHelpers.getDateTime(message.lastUpdated.at)} </span>`);
        }
        if (message.ip && message.ip.length) {

            messageDetailsContainer.appendRaw(`<samp>${DOMHelpers.escapeStringForContent(message.ip)}</samp>`);
        }
        if (message.commentsCount > 0) {

            const total = DisplayHelpers.intToString(message.commentsCount);
            const totalNoun = (1 == message.commentsCount) ? 'comment' : 'comments';
            const unsolved = DisplayHelpers.intToString(message.commentsCount - message.solvedCommentsCount);
            const text = `<span uk-icon="icon: warning"></span> ${total} ${totalNoun} (${unsolved} unsolved) <span uk-icon="icon: warning"></span>`;
            messageDetailsContainer.appendRaw(`<a class="show-thread-message-comments" data-message-id="${message.id}">${text}</a>`);
        }

        return messageDetailsContainer;
    }

    function getUsersWhoVotedTooltip(votes: ThreadMessageRepository.ThreadMessageVote[]) : string {

        if ( ! votes.length) return '–';

        votes.sort((first, second) => {

            return second.at - first.at;
        });

        return votes.map((v) => `${v.userName} (${DisplayHelpers.getShortDate(v.at)})`).join(' · ');
    }

    const VotedMark: string = ' ✓';

    function createThreadMessageAuthor(message: ThreadMessageRepository.ThreadMessage,
                                       thread: ThreadRepository.Thread): DOMAppender {

        const author = message.createdBy;
        const authorContainer = dA('<div class="message-author uk-float-left">');
        {
            const userContainer = dA('<div class="pointer-cursor">');
            authorContainer.append(userContainer);

            userContainer.append(UsersView.createUserLogoForList(author));

            const messageThread = message.parentThread || thread;
            let extraClass = '';

            if (messageThread && messageThread.createdBy && messageThread.createdBy.id === author.id) {

                extraClass = 'user-is-thread-author';
            }
            const usernameElement = UsersView.createUserNameElement(author, extraClass);

            userContainer.append(usernameElement);

            userContainer.append(UsersView.createUserTitleElement(author));
        }
        {
            authorContainer.append(UsersView.createUserDropdown(author, 'user-info', 'bottom-left'));
        }
        {
            author.signature = author.signature || '';

            const signatureContainer = dA('<div class="uk-text-center uk-float-left message-signature">');
            authorContainer.append(signatureContainer);

            const signature = dA('<span title="User signature" uk-tooltip>');
            signatureContainer.append(signature);
            signature.appendString(author.signature);
        }
        {

            let upVotesNr = (message.nrOfUpVotes || (message.nrOfUpVotes == 0))
                ? DisplayHelpers.intToString(message.nrOfUpVotes)
                : '?';
            let downVotesNr = (message.nrOfDownVotes || (message.nrOfDownVotes == 0))
                ? DisplayHelpers.intToString(message.nrOfDownVotes) : '?';

            const upVotesTooltip = [];
            const downVotesTooltip = [];

            let upVoteData = '';
            let downVoteData = '';
            let upVoteExtraClass = '';
            let downVoteExtraClass = '';

            if ((undefined === message.voteStatus) || (0 == message.voteStatus)) {

                if (Privileges.ThreadMessage.canUpVoteThreadMessage(message)) {

                    upVotesTooltip.push('Click to up vote message.');
                    upVoteData = ` data-upvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                    upVoteExtraClass = 'pointer-cursor';
                }
                if (Privileges.ThreadMessage.canDownVoteThreadMessage(message)) {

                    downVotesTooltip.push('Click to down vote message.');
                    downVoteData = ` data-downvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                    downVoteExtraClass = 'pointer-cursor';
                }
            }
            else if (Privileges.ThreadMessage.canResetVoteOfThreadMessage(message)) {

                if (-1 == message.voteStatus) {

                    downVotesTooltip.push('Click to reset vote.');
                    downVotesNr += VotedMark;
                    downVoteData = ` data-resetvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                }
                else {

                    upVotesTooltip.push('Click to reset vote.');
                    upVotesNr += VotedMark;
                    upVoteData = ` data-resetvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                }
            }

            authorContainer.appendRaw(`<div class="uk-text-center uk-float-left message-up-vote ${upVoteExtraClass}">` +
                `<span class="uk-label" ${upVoteData} title="${DOMHelpers.escapeStringForAttribute(upVotesTooltip.join('\n'))}">` +
                `&plus; ${upVotesNr}</span></div>`);
            authorContainer.appendRaw(`<div class="uk-text-center uk-float-right message-down-vote ${downVoteExtraClass}">` +
                `<span class="uk-label" ${downVoteData} title="${DOMHelpers.escapeStringForAttribute(downVotesTooltip.join('\n'))}">` +
                `&minus; ${downVotesNr}</span></div>`);
        }

        return authorContainer;
    }

    function createThreadMessageContent(message: ThreadMessageRepository.ThreadMessage): DOMAppender {

        const content = dA('<div class="message-content render-math">');
        content.appendRaw(ViewsExtra.expandContent(message.content));
        return content;
    }

    function createThreadMessageActionLinks(message: ThreadMessageRepository.ThreadMessage,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): DOMAppender {

        const actions = dA('<div class="message-actions">');
        const messageId = DOMHelpers.escapeStringForAttribute(message.id);

        if (Privileges.ThreadMessage.canEditThreadMessageContent(message)) {

            actions.appendRaw(`<a uk-icon="icon: file-edit" class="edit-thread-message-content-link" title="Edit message content" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (Privileges.ThreadMessage.canViewThreadMessageRequiredPrivileges(message)
            || Privileges.ThreadMessage.canViewThreadMessageAssignedPrivileges(message)) {

            actions.appendRaw(`<a uk-icon="icon: settings" class="show-thread-message-privileges-link" title="Privileges" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (Privileges.ThreadMessage.canMoveThreadMessage(message)) {

            actions.appendRaw(`<a uk-icon="icon: move" class="move-thread-message-link" title="Move to different thread" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (Privileges.ThreadMessage.canDeleteThreadMessage(message)) {

            actions.appendRaw(`<a uk-icon="icon: trash" class="delete-thread-message-link" title="Delete message" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (Privileges.ThreadMessage.canCommentThreadMessage(message)) {

            actions.appendRaw(`<a uk-icon="icon: warning" class="comment-thread-message-link" title="Flag & comment" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (quoteCallback) {
            actions.appendRaw(`<a uk-icon="icon: commenting" class="quote-thread-message-link" title="Quote content" data-message-id="${messageId}" uk-tooltip></a>`);
        }

        return actions;
    }

    function setupThreadMessageActionEvents(element: HTMLElement, messagesById,
                                            callback: PageActions.IThreadMessageCallback,
                                            threadCallback: PageActions.IThreadCallback,
                                            privilegesCallback: PageActions.IPrivilegesCallback,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void) {

        DOMHelpers.addEventListeners(element, 'edit-thread-message-content-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            showEditThreadMessageDialog(message.content, async (text: string, changeReason: string) => {

                if (await callback.editThreadMessageContent(messageId, text, changeReason)) {

                    new ThreadMessagesPage().displayForThreadMessage(messageId);
                }
            });
        });

        DOMHelpers.addEventListeners(element, 'show-thread-message-comments', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            showThreadMessageComments(message, callback);
        });

        DOMHelpers.addEventListeners(element, 'move-thread-message-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            ThreadsView.showSelectSingleThreadDialog(threadCallback, async (selected: string) => {

                EditViews.reloadPageIfOk(callback.moveThreadMessage(messageId, selected));
            });
        });

        DOMHelpers.addEventListeners(element, 'delete-thread-message-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            if (EditViews.confirm('Are you sure you want to delete the selected message?')) {

                EditViews.reloadPageIfOk(callback.deleteThreadMessage(messageId));
            }
        });

        DOMHelpers.addEventListeners(element, 'comment-thread-message-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            const comment = EditViews.getInput('Please enter a comment for the selected message');
            if (comment && comment.length) {

                if (await callback.commentThreadMessage(messageId, comment)) {

                    Views.showSuccessNotification('Comment sent!');
                }
            }
        });

        DOMHelpers.addEventListeners(element, 'quote-thread-message-link', 'click', (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            quoteCallback(message);
        });

        DOMHelpers.addEventListenersData(element, 'upvote-id', 'click', async (ev, messageId) => {

            if (await callback.upVote(messageId)) {

                const element = ev.target as HTMLElement;
                element.innerText = adjustVote(element.innerText, 1) + VotedMark;
                DOMHelpers.removeEventListeners(element);
            }
        });

        DOMHelpers.addEventListenersData(element, 'downvote-id', 'click', async (ev, messageId) => {

            if (await callback.downVote(messageId)) {

                const element = ev.target as HTMLElement;
                element.innerText = adjustVote(element.innerText, 1) + VotedMark;
                DOMHelpers.removeEventListeners(element);
            }
        });

        DOMHelpers.addEventListenersData(element, 'resetvote-id', 'click', async (ev, messageId) => {

            if (await callback.resetVote(messageId)) {

                const element = ev.target as HTMLElement;
                element.innerText = adjustVote(element.innerText, -1).replace(VotedMark, '');
                DOMHelpers.removeEventListeners(element);
            }
        });

        DOMHelpers.addEventListeners(element, 'show-thread-message-privileges-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            PrivilegesView.showThreadMessagePrivileges(message, privilegesCallback);
        });
    }

    function adjustVote(value: string, adjustement: number): string {

        return value.replace(/\d+/, (value) => (parseInt(value) + adjustement).toString());
    }

    const solvedCommentSpan = '<span class="uk-icon-button uk-float-right" uk-icon="check" title="Already solved" uk-tooltip></span>';

    async function showThreadMessageComments(message: ThreadMessageRepository.ThreadMessage,
                                             callback: PageActions.IThreadMessageCallback): Promise<void> {

        const modal = document.getElementById('thread-message-comments-modal');
        const content = modal.getElementsByClassName('message-comments-container')[0];

        content.innerHTML = '';

        Views.showModal(modal);

        const appender = dA('<div>');

        const comments = await callback.getCommentsOfThreadMessage(message.id) || [];

        for (let i = 0; i < comments.length; ++i) {

            const comment = comments[i];

            comment.message = comment.message || message;

            const card = dA('<div class="uk-card uk-card-body message-comments-content">');
            appender.append(card);

            createMessageCommentInList(comment, card);

            if (i < (comments.length - 1)) {

                appender.appendRaw(' <hr class="uk-divider-icon" />');
            }
        }

        const result = appender.toElement();

        setupMessageCommentLinks(result, callback);

        content.appendChild(result);
    }

    function createMessageCommentInList(comment: ThreadMessageRepository.ThreadMessageComment, container: DOMAppender) {

        const author = dA('<div class="message-comment-author uk-float-left">');
        container.append(author);
        author.append(UsersView.createUserLogoSmall(comment.createdBy, 'bottom-left'));

        const content = dA('<div class="comment-content">');
        container.append(content);

        const contentDiv = dA('<div>');
        content.append(contentDiv);

        const time = dA('<span class="message-time">');
        contentDiv.append(time);
        time.appendRaw(DisplayHelpers.getDateTime(comment.created));

        const ip = dA('<samp>');
        contentDiv.append(ip);
        ip.appendString(comment.ip);

        if (comment.solved) {

            contentDiv.appendRaw(solvedCommentSpan);
        }
        else if (Privileges.ThreadMessage.canSolveThreadMessageComment(comment.message)) {

            const data = `data-comment-id="${DOMHelpers.escapeStringForAttribute(comment.id)}"`;
            contentDiv.appendRaw(`<a class="solve-message-comment-link uk-float-right" ${data} title="Set comment to solved" uk-tooltip><span class="uk-icon" uk-icon="check"></span></a>`);
        }

        const paragraph = dA('<p>');
        contentDiv.append(paragraph);
        paragraph.appendString(comment.content);
    }

    function setupMessageCommentLinks(result: HTMLElement, callback: PageActions.IThreadMessageCallback) {

        const links = result.getElementsByClassName('solve-message-comment-link');
        DOMHelpers.forEach(links, link => {

            Views.onClick(link, async (ev) => {

                const link = DOMHelpers.getLink(ev);
                const commentId = link.getAttribute('data-comment-id');

                if (await callback.solveThreadMessageComment(commentId)) {

                    DOMHelpers.replaceElementWith(link, DOMHelpers.parseHTML(solvedCommentSpan));
                }
            });
        });
    }

    function createNewThreadMessageControl(thread: ThreadRepository.Thread,
                                           callback: PageActions.IThreadCallback): MessageEditControl {

        const result = cE('div');
        DOMHelpers.addClasses(result, 'reply-container');

        let editControl: EditViews.EditControl;

        if (Privileges.Thread.canAddNewThreadMessage(thread)) {

            editControl = new EditViews.EditControl(result);

            const button = cE('button');
            result.appendChild(button);
            DOMHelpers.addClasses(button, 'uk-button', 'uk-button-primary', 'uk-align-center');
            button.innerText = 'Add new message';

            Views.onClick(button, async () => {

                const text = editControl.getText();
                if (text.trim().length < 1) return;

                const newMessageId = await callback.addThreadMessage(thread.id, text);
                if (newMessageId) {

                    (new ThreadMessagesPage()).displayForThreadMessage(newMessageId);
                }
            })
        }
        else {

            result.appendChild(DOMHelpers.parseHTML('<span class="uk-align-center uk-text-center uk-alert">Insufficient privileges to add a new message to this thread.</span>'));
            editControl = new EditViews.EditControl(result);
        }

        return {

            element: result,
            editControl: editControl
        } as MessageEditControl;
    }

    export function showEditThreadMessageDialog(initialText: string,
                                                onSave: (text: string, changeReason: string) => void): void {

        const modal = document.getElementById('edit-thread-message-modal');
        Views.showModal(modal);

        const saveButton = DOMHelpers.removeEventListeners(
            modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement);
        const container = modal.getElementsByClassName('uk-modal-body')[0] as HTMLElement;
        const changeReasonInput = modal.getElementsByClassName('change-reason-input')[0] as HTMLInputElement;

        container.innerHTML = '';
        changeReasonInput.value = '';

        const editControl = new EditViews.EditControl(container, initialText);

        Views.onClick(saveButton, () => {

            const currentText = editControl.getText();

            if (currentText.length && (currentText != initialText)) {

                onSave(currentText, changeReasonInput.value);
            }
        });
    }

    export function createCommentsPageContent(collection: ThreadMessageRepository.ThreadMessageCommentCollection,
                                              info: CommentsPageDisplayInfo,
                                              onPageNumberChange: Views.PageNumberChangeCallback,
                                              getLinkForPage: Views.GetLinkForPageCallback,
                                              threadMessageCallback: PageActions.IThreadMessageCallback,
                                              userCallback: PageActions.IUserCallback,
                                              threadCallback: PageActions.IThreadCallback,
                                              privilegesCallback: PageActions.IPrivilegesCallback): ThreadMessageCommentsPageContent {

        collection = collection || ThreadMessageRepository.defaultThreadMessageCommentCollection();

        const result = new ThreadMessagesPageContent();

        const resultList = cE('div');

        if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, privilegesCallback));
        }
        else {

            const header = cE('h2');
            header.innerText = 'All Thread Message Comments';
            resultList.appendChild(header);
        }
        resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, 'thread message comments', onPageNumberChange, getLinkForPage));

        const listContainer = cE('div');
        DOMHelpers.addClasses(listContainer, 'thread-message-comments-list');
        listContainer.appendChild(createCommentsList(collection, threadMessageCallback,
            threadCallback, privilegesCallback, info.user));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, 'thread message comments', onPageNumberChange, getLinkForPage));

        result.list = resultList;

        return result;
    }

    export function createCommentsList(collection: ThreadMessageRepository.ThreadMessageCommentCollection,
                                       callback: PageActions.IThreadMessageCallback,
                                       threadCallback: PageActions.IThreadCallback,
                                       privilegesCallback: PageActions.IPrivilegesCallback,
                                       user?: UserRepository.User): HTMLElement {

        const comments = collection.messageComments || [];

        const result = dA('<div class="uk-container uk-container-expand">');

        if (comments.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No comments found</span>');
            return result.toElement();
        }

        const messagesById = {};

        for (let i = 0; i < comments.length; ++i) {

            const comment = comments[i];
            comment.createdBy = comment.createdBy || user;

            const message = comment.message;

            if (!message) continue;

            messagesById[message.id] = message;

            const messageContainer = dA('<div class="uk-card uk-card-body discussion-thread-message">');
            result.append(messageContainer);

            {
                const container = dA('<div class="message-comment-above-message">');
                messageContainer.append(container);

                createMessageCommentInList(comment, container);
            }

            createThreadMessageHeader(messageContainer, message, collection, i, true);
            messageContainer.append(createThreadMessageDetails(message, true));
            messageContainer.append(createThreadMessageAuthor(message, null));
            messageContainer.append(createThreadMessageActionLinks(message, null));
            messageContainer.append(createThreadMessageContent(message));

            if (i < (comments.length - 1)) {

                result.appendRaw('<hr class="uk-divider-icon" />');
            }
        }

        const element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);

        setupThreadMessageActionEvents(element, messagesById, callback, threadCallback, privilegesCallback);

        setupMessageCommentLinks(element, callback);

        return element;
    }

    function createMessageShortView(
        message: ThreadMessageRepository.ThreadMessage | ThreadMessageRepository.LatestMessage,
        createAuthorDropdown: boolean): DOMAppender {

        const container = dA('<div>');

        if (createAuthorDropdown) {

            container.append(UsersView.createUserLogoSmall(message.createdBy));
        }
        else {

            container.append(UsersView.createUserLogoSmall(message.createdBy, null));
        }

        const anyMessage = <any>message;

        const threadId = anyMessage.threadId
            ? anyMessage.threadId
            : (anyMessage.parentThread
                ? anyMessage.parentThread.id
                : '');
        const threadName = anyMessage.threadName
            ? anyMessage.threadName
            : (anyMessage.parentThread
                ? anyMessage.parentThread.name
                : '');

        const threadTitle = threadName || 'unknown';

        const href = Pages.getThreadMessagesOfThreadUrlFull({

            id: threadId,
            name: threadTitle

        } as ThreadRepository.Thread);

        const threadTitleElement = cE('a');
        DOMHelpers.addClasses(threadTitleElement, 'recent-message-thread-link');
        threadTitleElement.setAttribute('href', href);
        threadTitleElement.setAttribute('title', threadTitle);
        threadTitleElement.setAttribute('data-threadmessagethreadid', threadId);
        threadTitleElement.innerText = threadTitle;
        container.appendElement(threadTitleElement);

        const timeFlex = dA('<div class="date-time-flex">');
        container.append(timeFlex);

        timeFlex.append(UsersView.createAuthorSmall(message.createdBy));
        const recentMessageTime = dA('<div class="recent-message-time uk-text-meta">');
        timeFlex.append(recentMessageTime);

        const recentMessageTimeContent = cE('span');
        recentMessageTimeContent.innerHTML = DisplayHelpers.getDateTime(message.created);
        recentMessageTime.appendElement(recentMessageTimeContent);

        const messageContent = message.content || 'empty';

        const messageLink = cE('a');
        DOMHelpers.addClasses(messageLink, 'recent-message-link');
        messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id));
        messageLink.setAttribute('title', messageContent);
        messageLink.setAttribute('data-threadmessageid', message.id);
        messageLink.innerText = messageContent;
        container.appendElement(messageLink);

        return container;
    }

    export function createLatestMessageColumnView(latestMessage: ThreadMessageRepository.LatestMessage): DOMAppender {

        const latestMessageColumn = dA('<td class="latest-message">');

        latestMessageColumn.append(createMessageShortView(latestMessage, true));

        return latestMessageColumn;
    }
}