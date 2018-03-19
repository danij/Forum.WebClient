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
    import IThreadPrivileges = Privileges.IThreadPrivileges;
    import IThreadCallback = PageActions.IThreadCallback;
    import IUserPrivileges = Privileges.IUserPrivileges;
    import IUserCallback = PageActions.IUserCallback;
    import IThreadMessageCallback = PageActions.IThreadMessageCallback;
    import IThreadMessagePrivileges = Privileges.IThreadMessagePrivileges;
    import reloadPageIfOk = EditViews.reloadPageIfOk;
    import IPrivilegesCallback = PageActions.IPrivilegesCallback;

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

        let result = new DOMAppender('<div>', '</div>');

        for (let message of messages) {

            if (null === message) continue;

            let element = new DOMAppender('<div class="recent-message">', '</div>');
            result.append(element);

            let user = new DOMAppender('<span class="author">', '</span>');
            element.append(user);

            let userLink = new DOMAppender(`<a ${UsersView.getThreadsOfUserLinkContent(message.createdBy)}>`, '</a>');
            user.append(userLink);
            userLink.appendString(message.createdBy.name);

            let threadTitle = DOMHelpers.escapeStringForAttribute(message.parentThread.name);

            let href = Pages.getThreadMessagesOfThreadUrlFull(message.parentThread);
            let data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(message.parentThread.id)}"`;
            let threadLink = new DOMAppender(`<a href="${href}" class="recent-message-thread-link render-math" title="${threadTitle}" ${data}>`, '</a>');
            element.append(threadLink);
            threadLink.appendString(message.parentThread.name);

            let messageTitle = DOMHelpers.escapeStringForAttribute(message.content);

            href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
            data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
            let link = new DOMAppender(`<a href="${href}" class="recent-message-link render-math" title="${messageTitle}" ${data}>`, '</a>');
            element.append(link);
            link.appendRaw(ViewsExtra.expandContent(message.content));
        }

        let resultElement = result.toElement();

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
                                                    threadCallback: IThreadCallback,
                                                    threadPrivileges: IThreadPrivileges,
                                                    threadMessageCallback: IThreadMessageCallback,
                                                    threadMessagePrivileges: IThreadMessagePrivileges,
                                                    userCallback: IUserCallback,
                                                    userPrivileges: IUserPrivileges,
                                                    privilegesCallback: IPrivilegesCallback,
                                                    quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): ThreadMessagesPageContent {

        collection = collection || ThreadMessageRepository.defaultThreadMessageCollection();

        let result = new ThreadMessagesPageContent();

        let resultList = document.createElement('div');

        if (info.thread) {

            resultList.appendChild(ThreadsView.createThreadPageHeader(info.thread, threadCallback, threadPrivileges,
                privilegesCallback));
        }
        else if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, userPrivileges));
            resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));
        }

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        let editControl = thread ? createNewThreadMessageControl(thread.id, threadCallback, threadPrivileges) : null;

        let listContainer = document.createElement('div');
        listContainer.classList.add('thread-message-list');
        listContainer.appendChild(createThreadMessageList(collection, threadMessageCallback, threadMessagePrivileges,
            threadCallback, threadPrivileges, privilegesCallback, thread, quoteCallback));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

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
                                            callback: IThreadMessageCallback,
                                            privileges: IThreadMessagePrivileges,
                                            threadCallback: IThreadCallback,
                                            threadPrivileges: IThreadPrivileges,
                                            privilegesCallback: IPrivilegesCallback,
                                            thread?: ThreadRepository.Thread,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): HTMLElement {

        const messages = collection.messages || [];

        let result = new DOMAppender('<div class="uk-container uk-container-expand">', '</div>');

        if (messages.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No messages found</span>');
            return result.toElement();
        }

        let messagesById = {};

        for (let i = 0; i < messages.length; ++i) {

            const message = messages[i];
            messagesById[message.id] = message;

            let messageContainer = new DOMAppender('<div class="uk-card uk-card-body discussion-thread-message">', '</div>');
            result.append(messageContainer);

            const showParentThreadName = !!(message.receivedParentThread && message.parentThread.name
                && message.parentThread.name.length);

            createThreadMessageHeader(messageContainer, message, collection, i, showParentThreadName);
            messageContainer.append(createThreadMessageDetails(message, showParentThreadName));
            messageContainer.append(createThreadMessageAuthor(message, thread, privileges));
            messageContainer.append(createThreadMessageActionLinks(message, privileges, quoteCallback));
            messageContainer.append(createThreadMessageContent(message));

            if (i < (messages.length - 1)) {

                result.appendRaw('<hr class="uk-divider-icon" />');
            }
        }

        let element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);

        setupThreadMessageActionEvents(element, messagesById, callback, threadCallback, privilegesCallback, quoteCallback);

        return element;
    }

    function createThreadMessageHeader(messageContainer: DOMAppender, message: ThreadMessageRepository.ThreadMessage,
                                       collection: CommonEntities.PaginationInfo, i: number, showParentThreadName: boolean): void {

        if (showParentThreadName) {

            let href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
            let data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
            let id = DOMHelpers.escapeStringForAttribute('message-' + message.id);

            let link = new DOMAppender(`<a id="${id}" href="${href}" ${data}>`, '</a>');
            link.appendString(message.parentThread.name);

            let container = new DOMAppender('<div class="message-parent-thread render-math uk-card-badge">', '</div>');
            container.append(link);
            messageContainer.append(container);
        }
        else {

            const number = collection.page * collection.pageSize + i + 1;
            let href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
            let data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
            let id = DOMHelpers.escapeStringForAttribute('message-' + message.id);
            messageContainer.appendRaw(`<div class="message-number uk-text-meta"><a id="${id}" href="${href}" ${data}>#${DisplayHelpers.intToString(number)}</a></div>`);
        }
    }

    function createThreadMessageDetails(message: ThreadMessageRepository.ThreadMessage, showParentThreadName: boolean) {

        const extraClass = showParentThreadName ? 'right' : '';
        let messageDetailsContainer = new DOMAppender(`<div class="uk-card-badge message-time-container ${extraClass}">`, '</div>');
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
                                       thread: ThreadRepository.Thread,
                                       privileges: IThreadMessagePrivileges): DOMAppender {

        let author = message.createdBy;
        let authorContainer = new DOMAppender('<div class="message-author uk-float-left">', '</div>');
        {
            let userContainer = new DOMAppender('<div class="pointer-cursor">', '</div>');
            authorContainer.append(userContainer);

            userContainer.append(UsersView.createUserLogoForList(author));

            const messageThread = message.parentThread || thread;
            let extraClass = '';

            if (messageThread && messageThread.createdBy && messageThread.createdBy.id === author.id) {

                extraClass = 'user-is-thread-author';
            }
            let usernameElement = UsersView.createUserNameElement(author, extraClass);

            userContainer.append(usernameElement);

            userContainer.append(UsersView.createUserTitleElement(author));
        }
        {
            authorContainer.append(UsersView.createUserDropdown(author, 'user-info', 'bottom-left'));
        }
        {
            author.signature = author.signature || '';

            let signatureContainer = new DOMAppender('<div class="uk-text-center uk-float-left message-signature">', '</div>');
            authorContainer.append(signatureContainer);

            let signature = new DOMAppender('<span title="User signature" uk-tooltip>', '</span>');
            signatureContainer.append(signature);
            signature.appendString(author.signature);
        }
        {

            let upVotesNr = message.upVotes ? DisplayHelpers.intToString(message.upVotes.length) : '?';
            let downVotesNr = message.downVotes ? DisplayHelpers.intToString(message.downVotes.length) : '?';

            let upVotesTooltip = [];
            let downVotesTooltip = [];

            let upVoteData = '';
            let downVoteData = '';

            if ((undefined === message.voteStatus) || (0 == message.voteStatus)) {

                if (privileges.canUpVoteThreadMessage(message.id)) {

                    upVotesTooltip.push('Click to up vote message.');
                    upVoteData = ` data-upvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                }
                if (privileges.canDownVoteThreadMessage(message.id)) {

                    downVotesTooltip.push('Click to down vote message.');
                    downVoteData = ` data-downvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                }
            }
            else if (privileges.canResetVoteOfThreadMessage(message.id)) {

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

            if (message.upVotes && message.upVotes.length) {

                upVotesTooltip.push('Other voters: ' + getUsersWhoVotedTooltip(message.upVotes));
            }
            if (message.downVotes && message.downVotes.length) {

                downVotesTooltip.push('Other voters: ' + getUsersWhoVotedTooltip(message.downVotes));
            }

            authorContainer.appendRaw('<div class="uk-text-center uk-float-left message-up-vote">' +
                `<span class="uk-label" ${upVoteData} title="${DOMHelpers.escapeStringForAttribute(upVotesTooltip.join('\n'))}">` +
                `&plus; ${upVotesNr}</span></div>`);
            authorContainer.appendRaw('<div class="uk-text-center uk-float-right message-down-vote">' +
                `<span class="uk-label" ${downVoteData} title="${DOMHelpers.escapeStringForAttribute(downVotesTooltip.join('\n'))}">` +
                `&minus; ${downVotesNr}</span></div>`);
        }

        return authorContainer;
    }

    function createThreadMessageContent(message: ThreadMessageRepository.ThreadMessage): DOMAppender {

        let content = new DOMAppender('<div class="message-content render-math">', '</div>');
        content.appendRaw(ViewsExtra.expandContent(message.content));
        return content;
    }

    function createThreadMessageActionLinks(message: ThreadMessageRepository.ThreadMessage,
                                            privileges: IThreadMessagePrivileges,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): DOMAppender {

        let actions = new DOMAppender('<div class="message-actions">', '</div>');
        let messageId = DOMHelpers.escapeStringForAttribute(message.id);

        if (privileges.canEditThreadMessageContent(message.id)) {

            actions.appendRaw(`<a uk-icon="icon: file-edit" class="edit-thread-message-content-link" title="Edit message content" data-message-id="${messageId}" uk-tooltip></a>`);
        }

        actions.appendRaw(`<a uk-icon="icon: settings" class="show-thread-message-privileges-link" title="Privileges" data-message-id="${messageId}" uk-tooltip></a>`);

        if (privileges.canMoveThreadMessage(message.id)) {

            actions.appendRaw(`<a uk-icon="icon: move" class="move-thread-message-link" title="Move to different thread" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (privileges.canDeleteThreadMessage(message.id)) {

            actions.appendRaw(`<a uk-icon="icon: trash" class="delete-thread-message-link" title="Delete message" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (privileges.canCommentThreadMessage(message.id)) {

            actions.appendRaw(`<a uk-icon="icon: warning" class="comment-thread-message-link" title="Flag & comment" data-message-id="${messageId}" uk-tooltip></a>`);
        }
        if (quoteCallback) {
            actions.appendRaw(`<a uk-icon="icon: commenting" class="quote-thread-message-link" title="Quote content" data-message-id="${messageId}" uk-tooltip></a>`);
        }

        return actions;
    }

    function setupThreadMessageActionEvents(element: HTMLElement, messagesById, callback: IThreadMessageCallback,
                                            threadCallback: IThreadCallback,
                                            privilegesCallback: IPrivilegesCallback,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void) {

        DOMHelpers.addEventListeners(element, 'edit-thread-message-content-link', 'click', async (ev) => {

            ev.preventDefault();
            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            let message = messagesById[messageId];

            showEditThreadMessageDialog(message.content, async (text: string, changeReason: string) => {

                if (await callback.editThreadMessageContent(messageId, text, changeReason)) {

                    new ThreadMessagesPage().displayForThreadMessage(messageId);
                }
            });
        });

        DOMHelpers.addEventListeners(element, 'show-thread-message-comments', 'click', async (ev) => {

            ev.preventDefault();
            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            showThreadMessageComments(messageId, callback);
        });

        DOMHelpers.addEventListeners(element, 'move-thread-message-link', 'click', async (ev) => {

            ev.preventDefault();
            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            ThreadsView.showSelectSingleThreadDialog(threadCallback, async (selected: string) => {

                reloadPageIfOk(callback.moveThreadMessage(messageId, selected));
            });
        });

        DOMHelpers.addEventListeners(element, 'delete-thread-message-link', 'click', async (ev) => {

            ev.preventDefault();
            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            if (EditViews.confirm('Are you sure you want to delete the selected message?')) {

                reloadPageIfOk(callback.deleteThreadMessage(messageId));
            }
        });

        DOMHelpers.addEventListeners(element, 'comment-thread-message-link', 'click', async (ev) => {

            ev.preventDefault();
            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            const comment = EditViews.getInput('Please enter a comment for the selected message');
            if (comment && comment.length) {

                if (await callback.commentThreadMessage(messageId, comment)) {

                    Views.showSuccessNotification('Comment sent!');
                }
            }
        });

        DOMHelpers.addEventListeners(element, 'quote-thread-message-link', 'click', (ev) => {

            ev.preventDefault();
            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            let message = messagesById[messageId];

            quoteCallback(message);
        });

        DOMHelpers.addEventListenersData(element, 'upvote-id', 'click', async (ev, messageId) => {

            ev.preventDefault();

            if (await callback.upVote(messageId)) {

                let element = ev.target as HTMLElement;
                element.innerText = adjustVote(element.innerText, 1) + VotedMark;
                DOMHelpers.removeEventListeners(element);
            }
        });

        DOMHelpers.addEventListenersData(element, 'downvote-id', 'click', async (ev, messageId) => {

            ev.preventDefault();

            if (await callback.downVote(messageId)) {

                let element = ev.target as HTMLElement;
                element.innerText = adjustVote(element.innerText, 1) + VotedMark;
                DOMHelpers.removeEventListeners(element);
            }
        });

        DOMHelpers.addEventListenersData(element, 'resetvote-id', 'click', async (ev, messageId) => {

            ev.preventDefault();

            if (await callback.resetVote(messageId)) {

                let element = ev.target as HTMLElement;
                element.innerText = adjustVote(element.innerText, -1).replace(VotedMark, '');
                DOMHelpers.removeEventListeners(element);
            }
        });

        DOMHelpers.addEventListeners(element, 'show-thread-message-privileges-link', 'click', async (ev) => {

            ev.preventDefault();

            let messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            let message = messagesById[messageId];

            PrivilegesView.showThreadMessagePrivileges(message, privilegesCallback);
        });
    }

    function adjustVote(value: string, adjustement: number): string {

        return value.replace(/\d+/, (value) => (parseInt(value) + adjustement).toString());
    }

    const solvedCommentSpan = '<span class="uk-icon-button uk-float-right" uk-icon="check" title="Already solved" uk-tooltip></span>';

    async function showThreadMessageComments(messageId: string, callback: IThreadMessageCallback): Promise<void> {

        let modal = document.getElementById('thread-message-comments-modal');
        let content = modal.getElementsByClassName('message-comments-container')[0];

        content.innerHTML = '';

        Views.showModal(modal);

        let appender = new DOMAppender('<div>', '</div>');

        let comments = await callback.getCommentsOfThreadMessage(messageId) || [];

        for (let i = 0; i < comments.length; ++i) {

            const comment = comments[i];

            let card = new DOMAppender('<div class="uk-card uk-card-body message-comments-content">', '</div>');
            appender.append(card);

            createMessageCommentInList(comment, card);

            if (i < (comments.length - 1)) {

                appender.appendRaw(' <hr class="uk-divider-icon" />');
            }
        }

        let result = appender.toElement();

        setupMessageCommentLinks(result, callback);

        content.appendChild(result);
    }

    function createMessageCommentInList(comment: ThreadMessageRepository.ThreadMessageComment, container: DOMAppender) {

        let author = new DOMAppender('<div class="message-comment-author uk-float-left">', '</div>');
        container.append(author);
        author.append(UsersView.createUserLogoSmall(comment.createdBy, 'bottom-left'));

        let content = new DOMAppender('<div class="comment-content">', '</div>');
        container.append(content);

        let contentDiv = new DOMAppender('<div>', '</div>');
        content.append(contentDiv);

        let time = new DOMAppender('<span class="message-time">', '</span>');
        contentDiv.append(time);
        time.appendString(DisplayHelpers.getDateTime(comment.created));

        let ip = new DOMAppender('<samp>', '</samp>');
        contentDiv.append(ip);
        ip.appendString(comment.ip);

        if (comment.solved) {

            contentDiv.appendRaw(solvedCommentSpan);
        }
        else {

            let data = `data-comment-id="${DOMHelpers.escapeStringForAttribute(comment.id)}"`;
            contentDiv.appendRaw(`<a class="solve-message-comment-link uk-float-right" ${data} title="Set comment to solved" uk-tooltip><span class="uk-icon" uk-icon="check"></span></a>`);
        }

        let paragraph = new DOMAppender('<p>', '</p>');
        contentDiv.append(paragraph);
        paragraph.appendString(comment.content);
    }

    function setupMessageCommentLinks(result: HTMLElement, callback: IThreadMessageCallback) {

        let links = result.getElementsByClassName('solve-message-comment-link');
        for (let i = 0; i < links.length; ++i) {

            let link = links[i];
            link.addEventListener('click', async (ev) => {

                ev.preventDefault();
                let link = DOMHelpers.getLink(ev);
                const commentId = link.getAttribute('data-comment-id');

                if (await callback.solveThreadMessageComment(commentId)) {

                    DOMHelpers.replaceElementWith(link, DOMHelpers.parseHTML(solvedCommentSpan));
                }
            });
        }
    }

    function createNewThreadMessageControl(threadId: string,
                                           callback: IThreadCallback, privileges: IThreadPrivileges): MessageEditControl {

        let result = document.createElement('div');
        result.classList.add('reply-container');

        let editControl: EditViews.EditControl;

        if (privileges.canAddNewThreadMessage(threadId)) {

            editControl = new EditViews.EditControl(result);

            let button = document.createElement('button');
            result.appendChild(button);
            button.classList.add('uk-button', 'uk-button-primary', 'uk-align-center');
            button.innerText = 'Add new message';

            button.addEventListener('click', async (ev) => {

                ev.preventDefault();
                let text = editControl.getText();
                if (text.trim().length < 1) return;

                let newMessageId = await callback.addThreadMessage(threadId, text);
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

        let modal = document.getElementById('edit-thread-message-modal');
        Views.showModal(modal);

        let saveButton = modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement;
        let container = modal.getElementsByClassName('uk-modal-body')[0] as HTMLElement;
        let changeReasonInput = modal.getElementsByClassName('change-reason-input')[0] as HTMLInputElement;

        container.innerHTML = '';
        changeReasonInput.value = '';

        let editControl = new EditViews.EditControl(container, initialText);

        saveButton = DOMHelpers.removeEventListeners(saveButton);
        saveButton.addEventListener('click', (ev) => {

            ev.preventDefault();

            let currentText = editControl.getText();

            if (currentText.length && (currentText != initialText)) {

                onSave(currentText, changeReasonInput.value);
            }
        });
    }

    export function createCommentsPageContent(collection: ThreadMessageRepository.ThreadMessageCommentCollection,
                                              info: CommentsPageDisplayInfo,
                                              onPageNumberChange: Views.PageNumberChangeCallback,
                                              getLinkForPage: Views.GetLinkForPageCallback,
                                              threadMessageCallback: IThreadMessageCallback,
                                              threadMessagePrivileges: IThreadMessagePrivileges,
                                              userCallback: IUserCallback,
                                              userPrivileges: IUserPrivileges,
                                              threadCallback: IThreadCallback): ThreadMessageCommentsPageContent {

        collection = collection || ThreadMessageRepository.defaultThreadMessageCommentCollection();

        let result = new ThreadMessagesPageContent();

        let resultList = document.createElement('div');

        if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, userPrivileges));
        }
        else {

            let header = document.createElement('h2');
            header.innerText = 'All Thread Message Comments';
            resultList.appendChild(header);
        }
        resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        let listContainer = document.createElement('div');
        listContainer.classList.add('thread-message-comments-list');
        listContainer.appendChild(createCommentsList(collection, threadMessageCallback, threadMessagePrivileges,
            threadCallback, info.user));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        result.list = resultList;

        return result;
    }

    export function createCommentsList(collection: ThreadMessageRepository.ThreadMessageCommentCollection,
                                       callback: IThreadMessageCallback,
                                       privileges: IThreadMessagePrivileges,
                                       threadCallback: IThreadCallback,
                                       user?: UserRepository.User): HTMLElement {

        const comments = collection.messageComments || [];

        let result = new DOMAppender('<div class="uk-container uk-container-expand">', '</div>');

        if (comments.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No comments found</span>');
            return result.toElement();
        }

        let messagesById = {};

        for (let i = 0; i < comments.length; ++i) {

            let comment = comments[i];
            comment.createdBy = comment.createdBy || user;

            const message = comment.message;

            if (!message) continue;

            messagesById[message.id] = message;

            let messageContainer = new DOMAppender('<div class="uk-card uk-card-body discussion-thread-message">', '</div>');
            result.append(messageContainer);

            {
                let container = new DOMAppender('<div class="message-comment-above-message">', '</div>');
                messageContainer.append(container);

                createMessageCommentInList(comment, container);
            }

            createThreadMessageHeader(messageContainer, message, collection, i, true);
            messageContainer.append(createThreadMessageDetails(message, true));
            messageContainer.append(createThreadMessageAuthor(message, null, privileges));
            messageContainer.append(createThreadMessageActionLinks(message, privileges, null));
            messageContainer.append(createThreadMessageContent(message));

            if (i < (comments.length - 1)) {

                result.appendRaw('<hr class="uk-divider-icon" />');
            }
        }

        let element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);

        setupThreadMessageActionEvents(element, messagesById, callback, threadCallback, null);

        setupMessageCommentLinks(element, callback);

        return element;
    }
}