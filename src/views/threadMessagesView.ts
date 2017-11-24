import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {Views} from "./common";
import {ThreadRepository} from "../services/threadRepository";
import {UserRepository} from "../services/userRepository";
import {ThreadsView} from "./threadsView";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {ViewsExtra} from "./extra";

export module ThreadMessagesView {

    import DOMAppender = DOMHelpers.DOMAppender;

    export class ThreadMessagesPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement
    }

    export interface ThreadMessagePageDisplayInfo extends Views.SortInfo {

        thread?: ThreadRepository.ThreadWithMessages,
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
            let threadLink = new DOMAppender(`<a href="${href}" class="recent-message-thread-link" title="${threadTitle}" ${data}>`, '</a>');
            element.append(threadLink);
            threadLink.appendString(message.parentThread.name);

            let messageTitle = DOMHelpers.escapeStringForAttribute(message.content);

            href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
            data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
            let link = new DOMAppender(`<a href="${href}" class="recent-message-link no-math" title="${messageTitle}" ${data}>`, '</a>');
            element.append(link);
            link.appendString(message.content);
        }

        let resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);

        return resultElement;
    }

    export function createThreadMessagesPageContent(collection: ThreadMessageRepository.ThreadMessageCollection,
                                                    info: ThreadMessagePageDisplayInfo,
                                                    onPageNumberChange: Views.PageNumberChangeCallback,
                                                    getLinkForPage: Views.GetLinkForPageCallback,
                                                    thread: ThreadRepository.Thread): ThreadMessagesPageContent {

        collection = collection || ThreadMessageRepository.defaultThreadMessageCollection();

        let result = new ThreadMessagesPageContent();

        let resultList = document.createElement('div');

        if (info.thread) {

            resultList.appendChild(ThreadsView.createThreadPageHeader(info.thread));
        }
        else if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user));
            resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));
        }

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        let listContainer = document.createElement('div');
        listContainer.classList.add('thread-message-list');
        listContainer.appendChild(createThreadMessageList(collection, thread));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        result.list = resultList;
        return result;
    }

    function createThreadMessageListSortControls(info: Views.SortInfo): HTMLElement {

        return $('<div class="thread-messages-list-header uk-flex uk-flex-center">\n' +
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
            '</div>')[0];
    }


    export function createThreadMessageList(collection: ThreadMessageRepository.ThreadMessageCollection,
                                            thread?: ThreadRepository.Thread): HTMLElement {

        const messages = collection.messages || [];

        let result = new DOMAppender('<div class="uk-container uk-container-expand">', '</div>');

        if (messages.length < 1) {

            result.appendRaw('<span class="uk-text-warning">No messages found</span>');
            return result.toElement();
        }

        for (let i = 0; i < messages.length; ++i) {

            const message = messages[i];

            let messageContainer = new DOMAppender('<div class="uk-card uk-card-body discussion-thread-message">', '</div>');
            result.append(messageContainer);

            {
                const number = collection.page * collection.pageSize + i + 1;
                let href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(message.id);
                let data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(message.id)}"`;
                let id = DOMHelpers.escapeStringForAttribute('message-' + message.id);
                messageContainer.appendRaw(`<div class="message-number uk-text-meta"><a id="${id}" href="${href}" ${data}>#${DisplayHelpers.intToString(number)}</a></div>`);
            }
            {
                let author = message.createdBy;
                let authorContainer = new DOMAppender('<div class="message-author uk-float-left">', '</div>');
                messageContainer.append(authorContainer);
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
                    let upVotesNr = DisplayHelpers.intToString((message.upVotes || []).length);
                    let downVotesNr = DisplayHelpers.intToString((message.downVotes || []).length);

                    authorContainer.appendRaw(`<div class="uk-text-center uk-float-left message-up-vote"><span class="uk-label" title="Up vote message" uk-tooltip>&plus; ${upVotesNr}</span></div>`);
                    authorContainer.appendRaw(`<div class="uk-text-center uk-float-right message-down-vote"><span class="uk-label" title="Down vote message" uk-tooltip>&minus; ${downVotesNr}</span></div>`);
                }
            }
            {
                let messageDetailsContainer = new DOMAppender('<div class="uk-card-badge message-time-container">', '</div>');
                messageContainer.append(messageDetailsContainer);

                messageDetailsContainer.appendRaw(`<span class="message-time">${DisplayHelpers.getDateTime(message.created)} </span>`);

                if (message.lastUpdated && message.lastUpdated.at) {

                    messageDetailsContainer.appendRaw(`<span class="message-time uk-text-warning">Edited ${DisplayHelpers.getDateTime(message.lastUpdated.at)} </span>`);
                }
                if (message.ip && message.ip.length) {

                    messageDetailsContainer.appendRaw(`<samp>${DOMHelpers.escapeStringForContent(message.ip)}</samp>`);
                }
            }
            {
                /*
        <div class="message-actions">
            <a uk-icon="icon: file-edit" href="editMessage" title="Edit message content" uk-tooltip></a>
            <a uk-icon="icon: move" href="moveMessage" title="Move to different thread" uk-tooltip></a>
            <a uk-icon="icon: trash" href="deleteMessage" title="Delete message" uk-tooltip></a>
            <a uk-icon="icon: warning" href="commentMessage" title="Flag & comment" uk-tooltip></a>
            <a uk-icon="icon: commenting" href="quoteMessage" title="Quote content" uk-tooltip></a>
        </div>
                 */
            }
            {
                let content = new DOMAppender('<div class="message-content">', '</div>');
                messageContainer.append(content);
                content.appendRaw(ViewsExtra.expandContent(message.content));
            }

            if (i < (messages.length - 1)) {

                result.appendRaw('<hr class="uk-divider-icon" />');
            }
        }

        let element = result.toElement();

        adjustMessageContent(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupThreadMessagesOfMessageParentThreadLinks(element);

        return element;
    }

    function adjustMessageContent(container: HTMLElement): void{

        let contentElements = container.querySelectorAll('.message-content');

        for (let i = 0; i < contentElements.length; ++i) {

            let element = contentElements[i];

            let tables = element.querySelectorAll('table');
            for (let ti = 0; ti < tables.length; ++ti) {

                let table = tables[ti];
                table.classList.add('uk-table', 'uk-table-small', 'uk-table-striped');
            }
        }
    }
}