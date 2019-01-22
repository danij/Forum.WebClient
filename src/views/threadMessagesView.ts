import {ThreadMessageRepository} from '../services/threadMessageRepository';
import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {Views} from './common';
import {ThreadRepository} from '../services/threadRepository';
import {UserRepository} from '../services/userRepository';
import {UsersView} from './usersView';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {ViewsExtra} from './extra';
import {Privileges} from '../services/privileges';
import {PageActions} from '../pages/action';
import {EditViews} from './edit';
import {ThreadMessagesPage} from '../pages/threadMessagesPage';
import {ThreadsView} from './threadsView';
import {CommonEntities} from '../services/commonEntities';
import {PrivilegesView} from './privilegesView';
import {TagsView} from "./tagsView";
import {AttachmentsView} from "./attachmentsView";

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

        let atLeastOneMessage = false;

        for (let message of messages) {

            if (null === message) continue;

            atLeastOneMessage = true;

            const element = dA('<div class="recent-message" uk-no-boot>');
            result.append(element);

            element.append(createMessageShortView(message, false));
        }

        if ( ! atLeastOneMessage) {

            result.appendRaw('<span class="uk-text-warning">No more messages found</span>');
        }

        const resultElement = result.toElement();

        DOMHelpers.forEach(resultElement.getElementsByClassName('recent-message-thread-link'), link => {

            DOMHelpers.addClasses(link, 'render-math');
            ViewsExtra.refreshMath(link);
        });
        DOMHelpers.forEach(resultElement.getElementsByClassName('recent-message-link'), link => {

            link.title = '';
            DOMHelpers.addClasses(link, 'render-math');
            ViewsExtra.refreshMath(link);
        });

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupSubscribedThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);
        Views.setupAttachmentsAddedByUserLinks(resultElement);

        return resultElement;
    }

    export function createReceivedVotesView(voteHistory: UserRepository.VoteHistory): HTMLElement {

        const result = dA('<div>');

        let atLeastOneMessage = false;

        for (let vote of voteHistory.receivedVotes) {

            if ((null === vote) || (null === vote.message)) continue;

            atLeastOneMessage = true;

            const newVoteClass = (vote.at >= voteHistory.lastRetrievedAt) ? 'new-vote' : '';

            const element = dA(`<div class="voted-message ${newVoteClass}">`);
            result.append(element);

            const container = dA('<div>');
            element.append(container);

            const message = vote.message;

            const threadName = message.parentThread.name;
            const threadId = message.parentThread.id;

            const threadTitle = threadName || 'unknown';

            const href = Pages.getThreadMessagesOfThreadUrlFull({

                id: threadId,
                name: threadTitle

            } as ThreadRepository.Thread);

            const timeFlex = dA('<div class="date-time-flex">');
            container.append(timeFlex);

            const time = dA('<span class="time-ago">');
            timeFlex.append(time);
            time.appendString(DisplayHelpers.getAgoTimeShort(vote.at));

            const score = DisplayHelpers.intToString(Math.abs(vote.score));

            if (0 === vote.score) {

                timeFlex.appendRaw(`<span class="thread-vote neutral-vote" aria-expanded="false">0</span>`);
            }
            else if (vote.score < 0) {

                timeFlex.appendRaw(`<span class="thread-vote down-vote" aria-expanded="false">−${score}</span>`);
            }
            else {
                timeFlex.appendRaw(`<span class="thread-vote up-vote" aria-expanded="false">+${score}</span>`);
            }

            let threadTitleElement: HTMLElement;
            if (threadId) {

                threadTitleElement = cE('a');
                DOMHelpers.addClasses(threadTitleElement, 'voted-message-thread-link');
                threadTitleElement.setAttribute('href', href);
                threadTitleElement.setAttribute('title', threadTitle);
                threadTitleElement.setAttribute('data-threadmessagethreadid', threadId);
            }
            else {

                threadTitleElement = cE('span');
            }
            threadTitleElement.innerText = threadTitle;
            timeFlex.appendElement(threadTitleElement);

            const votedMessageTime = dA('<div class="voted-message-time uk-text-meta">');
            timeFlex.append(votedMessageTime);

            const votedMessageTimeContent = cE('span');
            if (message.created) {

                votedMessageTimeContent.innerHTML = DisplayHelpers.getDateTime(message.created);
            }
            votedMessageTime.appendElement(votedMessageTimeContent);

            const messageContent = message.content || 'empty';

            let messageLink: HTMLElement;
            if (message.id) {

                messageLink = cE('a');
                DOMHelpers.addClasses(messageLink, 'voted-message-link');
                messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id));
                messageLink.setAttribute('title', messageContent);
                messageLink.setAttribute('data-threadmessageid', message.id);
            }
            else {
                messageLink = cE('span');
            }
            messageLink.innerText = ViewsExtra.replaceUserIdReferencesWithName(messageContent);
            container.appendElement(messageLink);
        }

        if ( ! atLeastOneMessage) {

            result.appendRaw('<span class="uk-text-warning">No more messages found</span>');
        }

        const resultElement = result.toElement();

        DOMHelpers.forEach(resultElement.getElementsByClassName('voted-message-thread-link'), link => {

            DOMHelpers.addClasses(link, 'render-math');
            ViewsExtra.refreshMath(link);
        });
        DOMHelpers.forEach(resultElement.getElementsByClassName('voted-message-link'), link => {

            link.title = '';
            DOMHelpers.addClasses(link, 'render-math');
            ViewsExtra.refreshMath(link);
        });

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupSubscribedThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);
        Views.setupAttachmentsAddedByUserLinks(resultElement);

        return resultElement;
    }

    export async function createThreadMessagesPageContent(collection: ThreadMessageRepository.ThreadMessageCollection,
                                                          info: ThreadMessagePageDisplayInfo,
                                                          onPageNumberChange: Views.PageNumberChangeCallback,
                                                          getLinkForPage: Views.GetLinkForPageCallback,
                                                          thread: ThreadRepository.Thread,
                                                          threadCallback: PageActions.IThreadCallback,
                                                          threadMessageCallback: PageActions.IThreadMessageCallback,
                                                          tagCallback: PageActions.ITagCallback,
                                                          userCallback: PageActions.IUserCallback,
                                                          attachmentsCallback: PageActions.IAttachmentCallback,
                                                          privilegesCallback: PageActions.IPrivilegesCallback,
                                                          quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): Promise<ThreadMessagesPageContent> {

        collection = collection || ThreadMessageRepository.defaultThreadMessageCollection();

        const result = new ThreadMessagesPageContent();

        const resultList = cE('div');

        if (info.thread) {

            resultList.appendChild(ThreadsView.createThreadPageHeader(info.thread, threadCallback, tagCallback,
                privilegesCallback));
        }
        else if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, privilegesCallback));
            resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));
        }

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, 'thread messages', onPageNumberChange, getLinkForPage));

        const editControl = thread ? createNewThreadMessageControl(thread, threadCallback, attachmentsCallback) : null;

        const listContainer = cE('div');
        DOMHelpers.addClasses(listContainer, 'thread-message-list');
        listContainer.appendChild(await createThreadMessageList(collection, threadMessageCallback, threadCallback,
            attachmentsCallback, privilegesCallback, thread, quoteCallback));
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

    export async function createThreadMessageList(collection: ThreadMessageRepository.ThreadMessageCollection,
                                                  callback: PageActions.IThreadMessageCallback,
                                                  threadCallback: PageActions.IThreadCallback,
                                                  attachmentsCallback: PageActions.IAttachmentCallback,
                                                  privilegesCallback: PageActions.IPrivilegesCallback,
                                                  thread?: ThreadRepository.Thread,
                                                  quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): Promise<HTMLElement> {

        const messages = collection.messages || [];

        const result = dA('<div class="uk-container uk-container-expand">');

        if (messages.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No messages found</span>');
            return result.toElement();
        }

        const messagesById = {};
        const attachmentsById = {};

        const allMessages = messages
            .filter(m => m)
            .map(m => m.content);
        await ViewsExtra.searchUsersById(allMessages);

        for (let i = 0; i < messages.length; ++i) {

            const message = messages[i];
            messagesById[message.id] = message;

            const messageContainer = dA('<div class="uk-card uk-card-body discussion-thread-message">');
            result.append(messageContainer);

            const showParentThreadName = !!(message.receivedParentThread && message.parentThread.name
                && message.parentThread.name.length);

            createThreadMessageHeader(messageContainer, message, collection, i, showParentThreadName);
            messageContainer.append(createThreadMessageDetails(message, showParentThreadName));

            const flexContainer = dA('<div class="uk-flex">');
            messageContainer.append(flexContainer);

            flexContainer.append(createThreadMessageAuthor(message, thread));
            const messageContent = createThreadMessageContent(message);
            flexContainer.append(messageContent);
            flexContainer.append(createThreadMessageActionLinks(message, quoteCallback));

            messageContainer.append(createThreadMessageFooter(message));

            message.attachments = message.attachments || [];

            for (let attachment of message.attachments.filter(a => a)) {

                attachmentsById[attachment.id] = attachment;
            }
            messageContent.append(AttachmentsView.createAttachmentsOfMessageList(message.attachments,
                message));

            result.appendRaw('<hr class="uk-divider-icon" />');
        }

        const element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);
        Views.setupThreadsWithTagsLinks(element);
        Views.setupAttachmentsAddedByUserLinks(element);

        AttachmentsView.setupAttachmentActionEvents(element, attachmentsById, attachmentsCallback);

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

            for (let tag of (message.parentThread.tags || [])) {

                container.append(TagsView.createTagElement(tag));
            }

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
        const messageDetailsContainer = dA(`<div class="uk-card-badge message-time-container ${extraClass}" uk-no-boot>`);
        messageDetailsContainer.appendRaw(`<span class="message-time">${DisplayHelpers.getDateTime(message.created)} </span>`);

        if (message.lastUpdated && message.lastUpdated.at) {

            messageDetailsContainer.appendRaw(`<span class="message-time uk-text-warning">Edited ${DisplayHelpers.getDateTime(message.lastUpdated.at)} </span>`);
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

    const VotedMark: string = ' ✓';

    function createThreadMessageAuthor(message: ThreadMessageRepository.ThreadMessage,
                                       thread: ThreadRepository.Thread): DOMAppender {

        const author = message.createdBy;
        const authorContainer = dA('<div class="message-author">');
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

            userContainer.append(UsersView.createUserTitleElement(author, false));
        }
        {
            authorContainer.append(UsersView.createUserDropdown(author, 'user-info', 'bottom-left'));
        }
        return authorContainer;
    }

    function createThreadMessageFooter(message: ThreadMessageRepository.ThreadMessage): DOMAppender {

        const author = message.createdBy;

        const container = dA('<div class="uk-flex" uk-no-boot>');

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
                downVoteData = ` data-resetvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                downVoteExtraClass = 'pointer-cursor';
            }
            else {

                upVotesTooltip.push('Click to reset vote.');
                upVoteData = ` data-resetvote-id="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                upVoteExtraClass = 'pointer-cursor';
            }
        }
        if (-1 == message.voteStatus) {

            downVotesNr += VotedMark;
        }
        else if (1 == message.voteStatus) {

            upVotesNr += VotedMark;
        }

        container.appendRaw(`<div class="uk-text-center message-down-vote ${downVoteExtraClass}">` +
            `<span class="uk-label" ${downVoteData} title="${DOMHelpers.escapeStringForAttribute(downVotesTooltip.join('\n'))}">` +
            `&minus; ${downVotesNr}</span></div>`);

        {
            author.signature = author.signature || '';

            const signatureContainer = dA('<div class="uk-text-center uk-flex-1 message-signature">');
            container.append(signatureContainer);

            const signature = dA('<span title="User signature">');
            signatureContainer.append(signature);
            signature.appendRaw(ViewsExtra.wrapEmojis(DOMHelpers.escapeStringForContent(author.signature)));
        }

        container.appendRaw(`<div class="uk-text-center message-up-vote ${upVoteExtraClass}">` +
            `<span class="uk-label" ${upVoteData} title="${DOMHelpers.escapeStringForAttribute(upVotesTooltip.join('\n'))}">` +
            `&plus; ${upVotesNr}</span></div>`);

        return container;
    }

    function createThreadMessageContent(message: ThreadMessageRepository.ThreadMessage): DOMAppender {

        const unapprovedClass = message.approved ? '' : 'unapproved';
        const unapprovedTitle = message.approved ? '' : ' title="Not yet approved. Message is only visible to the author and privileged users."';
        const content = dA(`<div class="message-content ${unapprovedClass} render-math uk-flex-1" ${unapprovedTitle}>`);
        const wrapper = dA('<div uk-no-boot>');
        content.append(wrapper);
        wrapper.appendRaw(ViewsExtra.expandContent(message.content));

        if (message.lastUpdated && message.lastUpdated.at) {

            let reason = (message.lastUpdated.reason || '').trim();
            if (reason.length < 1) {
                reason = '<no reason>';
            }

            const details = dA('<span class="uk-text-warning">');
            wrapper.append(details);

            if (message.lastUpdated.userName) {

                details.appendString(`Last edited by ${message.lastUpdated.userName}: ${reason}`);
            }
        }

        return content;
    }

    function createThreadMessageActionLinks(message: ThreadMessageRepository.ThreadMessage,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void): DOMAppender {

        const actions = dA('<div class="message-actions">');
        const messageId = DOMHelpers.escapeStringForAttribute(message.id);

        if (Privileges.ThreadMessage.canEditThreadMessageApproval(message)) {

            actions.appendRaw(`<a uk-icon="icon: check" class="approve-thread-message-link" title="Approve Content" data-message-id="${messageId}"></a>`);
            actions.appendRaw(`<a uk-icon="icon: ban" class="unapprove-thread-message-link" title="Unapprove Content" data-message-id="${messageId}"></a>`);
        }

        if (Privileges.ThreadMessage.canEditThreadMessageContent(message)) {

            actions.appendRaw(`<a uk-icon="icon: file-edit" class="edit-thread-message-content-link" title="Edit message content" data-message-id="${messageId}"></a>`);
        }

        if (Privileges.Attachment.canAddAttachmentToMessage(message)) {

            actions.appendRaw(`<a class="add-attachment-to-message-link" uk-icon="icon: upload" title="Add attachment" data-message-id="${message.id}"></a>`);
        }

        if (Privileges.ThreadMessage.canViewThreadMessageRequiredPrivileges(message)
            || Privileges.ThreadMessage.canViewThreadMessageAssignedPrivileges(message)) {

            actions.appendRaw(`<a uk-icon="icon: settings" class="show-thread-message-privileges-link" title="Privileges" data-message-id="${messageId}"></a>`);
        }
        if (Privileges.ThreadMessage.canMoveThreadMessage(message)) {

            actions.appendRaw(`<a uk-icon="icon: move" class="move-thread-message-link" title="Move to different thread" data-message-id="${messageId}"></a>`);
        }
        if (Privileges.ThreadMessage.canDeleteThreadMessage(message)) {

            actions.appendRaw(`<a uk-icon="icon: trash" class="delete-thread-message-link" title="Delete message" data-message-id="${messageId}"></a>`);
        }
        if (Privileges.ThreadMessage.canCommentThreadMessage(message)) {

            actions.appendRaw(`<a uk-icon="icon: warning" class="comment-thread-message-link" title="Flag & comment" data-message-id="${messageId}"></a>`);
        }
        if (quoteCallback) {

            actions.appendRaw(`<a uk-icon="icon: quote-right" class="quote-thread-message-link" title="Quote content" data-message-id="${messageId}"></a>`);
        }

        return actions;
    }

    function setupThreadMessageActionEvents(element: HTMLElement, messagesById,
                                            callback: PageActions.IThreadMessageCallback,
                                            threadCallback: PageActions.IThreadCallback,
                                            privilegesCallback: PageActions.IPrivilegesCallback,
                                            quoteCallback?: (message: ThreadMessageRepository.ThreadMessage) => void) {

        function getMessageContent(ev: Event): HTMLElement {

            return DOMHelpers.goUpUntil(ev.target as HTMLElement, e => e.classList.contains('uk-flex'))
                .getElementsByClassName('message-content')[0] as HTMLElement;
        }

        DOMHelpers.addEventListeners(element, 'approve-thread-message-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            if (message.approved) return;

            if (await callback.approve(messageId)) {

                message.approved = true;

                DOMHelpers.removeClasses(getMessageContent(ev), 'unapproved');
            }
        });

        DOMHelpers.addEventListeners(element, 'unapprove-thread-message-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            if ( ! message.approved) return;

            if (await callback.unapprove(messageId)) {

                message.approved = false;

                DOMHelpers.addClasses(getMessageContent(ev), 'unapproved');
            }
        });

        DOMHelpers.addEventListeners(element, 'edit-thread-message-content-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');
            const message = messagesById[messageId];

            showEditThreadMessageDialog(message.content, async (text: string, changeReason: string) => {

                const min = Views.DisplayConfig.messageContentLengths.min;
                const max = Views.DisplayConfig.messageContentLengths.max;

                if (text.length < min) {

                    Views.showWarningNotification(`Message must be at least ${min} characters long.`);
                    return;
                }
                if (text.length > max) {

                    Views.showWarningNotification(`Message must be less than ${max} characters long.`);
                    return;
                }

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

    const solvedCommentSpan = '<span class="uk-icon-button uk-float-right" uk-icon="check" title="Already solved"></span>';

    async function showThreadMessageComments(message: ThreadMessageRepository.ThreadMessage,
                                             callback: PageActions.IThreadMessageCallback): Promise<void> {

        const modal = document.getElementById('thread-message-comments-modal');
        const content = modal.getElementsByClassName('message-comments-container')[0];

        content.innerHTML = '';

        Views.showModal(modal);

        const appender = dA('<div>');

        const comments = await callback.getCommentsOfThreadMessage(message.id) || [];

        const allComments = comments
            .filter(m => m)
            .map(m => m.content);
        await ViewsExtra.searchUsersById(allComments);

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
            contentDiv.appendRaw(`<a class="solve-message-comment-link uk-float-right" ${data} title="Set comment to solved"><span class="uk-icon" uk-icon="check"></span></a>`);
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
                                           callback: PageActions.IThreadCallback,
                                           attachmentsCallback: PageActions.IAttachmentCallback): MessageEditControl {

        const result = cE('div');
        DOMHelpers.addClasses(result, 'reply-container');

        let editControl: EditViews.EditControl;

        if (Privileges.Thread.canAddNewThreadMessage(thread)) {

            editControl = new EditViews.EditControl(result);

            result.appendChild(AttachmentsView.createAttachmentsOfMessageList([],
                ThreadMessageRepository.emptyMessage()).toElement());

            const link = DOMHelpers.parseHTML('<a class="add-attachment-to-message-link">Add attachment</a>');
            result.appendChild(link);

            const futureMessageCallback = new PageActions.AttachmentCallbackForFutureMessage(attachmentsCallback);
            AttachmentsView.setupAttachmentActionEvents(link, {}, futureMessageCallback);

            const button = cE('button');
            result.appendChild(button);
            DOMHelpers.addClasses(button, 'uk-button', 'uk-button-primary', 'uk-align-center');
            button.innerText = 'Add new message';

            Views.onClick(button, async () => {

                const text = (await editControl.getText()).trim();
                if (text.trim().length < 1) return;

                const min = Views.DisplayConfig.messageContentLengths.min;
                const max = Views.DisplayConfig.messageContentLengths.max;

                if (text.length < min) {

                    Views.showWarningNotification(`Message must be at least ${min} characters long.`);
                    return;
                }
                if (text.length > max) {

                    Views.showWarningNotification(`Message must be less than ${max} characters long.`);
                    return;
                }

                const newMessageId = await callback.addThreadMessage(thread.id, text);

                if (newMessageId) {

                    for (let attachmentId of futureMessageCallback.getAddedAttachmentIds()) {

                        try{
                            await attachmentsCallback.addAttachmentToMessage(attachmentId, newMessageId);
                        }
                        catch {}
                    }

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

        Views.onClick(saveButton, async () => {

            const currentText = (await editControl.getText()).trim();

            if (currentText.length && (currentText != initialText)) {

                onSave(currentText, changeReasonInput.value);
            }
        });
    }

    export async function createCommentsPageContent(collection: ThreadMessageRepository.ThreadMessageCommentCollection,
                                                    info: CommentsPageDisplayInfo,
                                                    onPageNumberChange: Views.PageNumberChangeCallback,
                                                    getLinkForPage: Views.GetLinkForPageCallback,
                                                    threadMessageCallback: PageActions.IThreadMessageCallback,
                                                    userCallback: PageActions.IUserCallback,
                                                    threadCallback: PageActions.IThreadCallback,
                                                    attachmentsCallback: PageActions.IAttachmentCallback,
                                                    privilegesCallback: PageActions.IPrivilegesCallback): Promise<ThreadMessageCommentsPageContent> {

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
        listContainer.appendChild(await createCommentsList(collection, threadMessageCallback,
            threadCallback, attachmentsCallback, privilegesCallback, info.user));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, 'thread message comments', onPageNumberChange, getLinkForPage));

        result.list = resultList;

        return result;
    }

    export async function createCommentsList(collection: ThreadMessageRepository.ThreadMessageCommentCollection,
                                             callback: PageActions.IThreadMessageCallback,
                                             threadCallback: PageActions.IThreadCallback,
                                             attachmentsCallback: PageActions.IAttachmentCallback,
                                             privilegesCallback: PageActions.IPrivilegesCallback,
                                             user?: UserRepository.User): Promise<HTMLElement> {

        const comments = collection.messageComments || [];

        const result = dA('<div class="uk-container uk-container-expand">');

        if (comments.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No comments found</span>');
            return result.toElement();
        }

        const messagesById = {};
        const attachmentsById = {};

        const allComments = comments
            .filter(m => m)
            .map(m => m.content);
        await ViewsExtra.searchUsersById(allComments);

        for (let i = 0; i < comments.length; ++i) {

            const comment = comments[i];
            comment.createdBy = comment.createdBy || user;

            const message = comment.message;

            if (! message) continue;

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

            {
                const flex = dA('<div class="uk-flex">');
                messageContainer.append(flex);

                flex.append(createThreadMessageAuthor(message, null));
                const messageContent = createThreadMessageContent(message);
                flex.append(messageContent);
                flex.append(createThreadMessageActionLinks(message, null));

                if (message.attachments) {

                    for (let attachment of message.attachments.filter(a => a)) {

                        attachmentsById[attachment.id] = attachment;
                    }
                    messageContent.append(AttachmentsView.createAttachmentsOfMessageList(message.attachments,
                        message));
                }
            }

            result.appendRaw('<hr class="uk-divider-icon" />');
        }

        const element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);
        Views.setupThreadsWithTagsLinks(element);
        Views.setupAttachmentsAddedByUserLinks(element);

        setupThreadMessageActionEvents(element, messagesById, callback, threadCallback, privilegesCallback);
        AttachmentsView.setupAttachmentActionEvents(element, attachmentsById, attachmentsCallback);

        setupMessageCommentLinks(element, callback);

        return element;
    }

    function createMessageShortView(
        message: ThreadMessageRepository.ThreadMessage | ThreadMessageRepository.LatestMessage,
        createAuthorDropdown: boolean): DOMAppender {

        const container = dA('<div>');

        if (createAuthorDropdown && message.createdBy && message.createdBy.id) {

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

        let threadTitleElement: HTMLElement;
        if (threadId) {

            threadTitleElement = cE('a');
            threadTitleElement.setAttribute('uk-no-boot', '');
            DOMHelpers.addClasses(threadTitleElement, 'recent-message-thread-link');
            if (anyMessage.parentThread && (! anyMessage.parentThread.approved)) {

                DOMHelpers.addClasses(threadTitleElement, 'unapproved');
            }

            threadTitleElement.setAttribute('href', href);
            threadTitleElement.setAttribute('title', threadTitle);
            threadTitleElement.setAttribute('data-threadmessagethreadid', threadId);
        }
        else {

            threadTitleElement = cE('span');
        }
        threadTitleElement.innerText = threadTitle;
        container.appendElement(threadTitleElement);

        const timeFlex = dA('<div class="date-time-flex" uk-no-boot>');
        container.append(timeFlex);

        timeFlex.append(UsersView.createAuthorSmall(message.createdBy));
        const recentMessageTime = dA('<div class="recent-message-time uk-text-meta">');
        timeFlex.append(recentMessageTime);

        const recentMessageTimeContent = cE('span');
        if (message.created) {

            recentMessageTimeContent.innerHTML = DisplayHelpers.getDateTime(message.created);
        }
        recentMessageTime.appendElement(recentMessageTimeContent);

        const messageContent = message.content || 'empty';

        let messageLink: HTMLElement;
        if (message.id) {

            messageLink = cE('a');
            messageLink.setAttribute('uk-no-boot', '');
            DOMHelpers.addClasses(messageLink, 'recent-message-link');
            if ( ! message.approved) {

                DOMHelpers.addClasses(messageLink, 'unapproved');
            }
            messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id));
            messageLink.setAttribute('title', messageContent);
            messageLink.setAttribute('data-threadmessageid', message.id);
        }
        else {
            messageLink = cE('span');
        }
        messageLink.innerText = ViewsExtra.replaceUserIdReferencesWithName(messageContent);
        container.appendElement(messageLink);

        return container;
    }

    export function createLatestMessageColumnView(latestMessage: ThreadMessageRepository.LatestMessage): DOMAppender {

        const latestMessageColumn = dA('<td class="latest-message">');

        latestMessageColumn.append(createMessageShortView(latestMessage, true));

        return latestMessageColumn;
    }
}