import {ThreadRepository} from "../services/threadRepository";
import {Views} from "./common";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {TagsView} from "./tagsView";
import {DOMHelpers} from "../helpers/domHelpers";
import {TagRepository} from "../services/tagRepository";
import {UserRepository} from "../services/userRepository";
import {Pages} from "../pages/common";

export module ThreadsView {

    import DOMAppender = DOMHelpers.DOMAppender;

    export class ThreadsPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement
    }

    export interface ThreadPageDisplayInfo extends Views.SortInfo {

        tag?: TagRepository.Tag,
        user?: UserRepository.User
    }

    export function createThreadsPageContent(collection: ThreadRepository.ThreadCollection,
                                             info: ThreadPageDisplayInfo,
                                             onPageNumberChange: Views.PageNumberChangeCallback) {

        collection = collection || ThreadRepository.defaultThreadCollection();

        let result = new ThreadsPageContent();

        let resultList = $("<div></div>");

        if (info.tag) {

            resultList.append(TagsView.createTagPageHeader(info.tag));
        }
        else if (info.user) {

            resultList.append(UsersView.createUserPageHeader(info.user));
        }

        resultList.append(result.sortControls = createThreadListSortControls(info));
        resultList.append(result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange));

        let tableContainer = $('<div class="threads-table"></div>');
        resultList.append(tableContainer);
        tableContainer.append(createThreadsTable(collection.threads));

        resultList.append(result.paginationBottom = Views.createPaginationControl(collection, onPageNumberChange));

        result.list = resultList[0];
        return result;
    }

    function createThreadListSortControls(info: Views.SortInfo): HTMLElement {

        return $('<div class="threads-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="order-by">\n' +
            '                Sort by:\n' +
            Views.createOrderByLabel('name', 'Name', info) +
            Views.createOrderByLabel('created', 'Created', info) +
            Views.createOrderByLabel('latestmessagecreated', 'Latest Message Added', info) +
            Views.createOrderByLabel('messagecount', 'Message Count', info) +
            '            </div>\n' +
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

    export function createThreadsTable(threads: ThreadRepository.Thread[]): HTMLElement {

        if (threads.length < 1) {

            return DOMHelpers.parseHTML('<span class="uk-text-warning">No threads found</span>');
        }

        let table = new DOMAppender('<table class="uk-table uk-table-divider uk-table-middle">', '</table>');

        let tableHeader = '<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Thread</th>\n' +
            '        <th class="uk-text-center thread-created-header uk-table-shrink">Added</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);

        let tbody = new DOMAppender('<tbody>', '</tbody>');
        table.append(tbody);

        for (let thread of threads) {

            if (null == thread) continue;

            let row = new DOMAppender('<tr>', '</tr>');
            tbody.append(row);
            {
                let nameColumn = new DOMAppender('<td class="uk-table-expand">', '</td>');
                row.append(nameColumn);

                const iconClass = thread.visitedSinceLastChange ? 'uk-icon' : 'uk-icon-button';
                const icon = thread.pinned ? 'star' : 'forward';
                nameColumn.append(new DOMAppender(`<span class="${iconClass}" uk-icon="icon: ${icon}">`, '</span>'));

                let href = Pages.getThreadMessagesOfThreadUrlFull(thread);
                let data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;

                let threadLink = new DOMAppender(`<a class="uk-button uk-button-text" href="${href}" ${data}>`, '</a>');
                nameColumn.append(threadLink);
                threadLink.appendString(' ' + thread.name);

                let details = new DOMAppender('<div class="thread-tags">', '</div>');
                nameColumn.append(details);

                if (thread.voteScore < 0) {
                    details.appendRaw(`<span class="uk-label score-down">− ${DisplayHelpers.intToString(Math.abs(thread.voteScore))}</span>`);
                }
                else if (thread.voteScore == 0) {
                    details.appendRaw(`<span class="uk-label score-up">0</span>`);
                }
                else {
                    details.appendRaw(`<span class="uk-label score-up">+ ${DisplayHelpers.intToString(thread.voteScore)}</span>`);
                }
                details.appendRaw(' ');

                for (let tag of thread.tags) {

                    if (null == tag) continue;

                    details.append(TagsView.createTagElement(tag));
                    details.appendRaw(' ');
                }
            }
            {
                let createdColumn = new DOMAppender('<td class="thread-created uk-text-center uk-table-shrink">', '</td>');
                row.append(createdColumn);

                createdColumn.append(UsersView.createUserLogoSmall(thread.createdBy));
                createdColumn.append(UsersView.createAuthorSmall(thread.createdBy));

                createdColumn.appendRaw(('<div class="thread-message-time uk-text-meta">\n' +
                    '    <span>{Added}</span>\n' +
                    '</div>')
                    .replace('{Added}', DisplayHelpers.getDateTime(thread.created)));
            }
            {
                let statisticsColumn = ('<td class="thread-statistics uk-table-shrink">\n' +
                    '    <table>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfMessages}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">messages</td>\n' +
                    '        </tr>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfViews}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">views</td>\n' +
                    '        </tr>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfSubscribed}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">subscribed</td>\n' +
                    '        </tr>\n' +
                    '    </table>\n' +
                    '</td>')
                    .replace('{nrOfMessages}', DisplayHelpers.intToString(thread.messageCount))
                    .replace('{nrOfViews}', DisplayHelpers.intToString(thread.visited))
                    .replace('{nrOfSubscribed}', DisplayHelpers.intToString(thread.subscribedUsersCount));
                row.appendRaw(statisticsColumn);
            }
            {
                let latestMessageColumn = new DOMAppender('<td class="latest-message uk-text-center">', '</td>');
                row.append(latestMessageColumn);

                const latestMessage = thread.latestMessage;

                latestMessageColumn.append(UsersView.createUserLogoSmall(latestMessage.createdBy));

                let authorElement = UsersView.createAuthorSmall(latestMessage.createdBy);
                latestMessageColumn.append(authorElement);

                let recentMessageTime = $('<span class="uk-text-meta"></span>');

                recentMessageTime.text(DisplayHelpers.getDateTime(latestMessage.created));
                authorElement.appendElement(recentMessageTime[0]);

                let messageContent = latestMessage.content || 'empty';

                let href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(latestMessage.id);
                let data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(latestMessage.id)}"`;

                let messageLink = $(`<a class="recent-message-link" href="${href}" ${data}></a>`);
                messageLink.text(messageContent);
                messageLink.attr('title', messageContent);
                latestMessageColumn.appendElement(messageLink[0]);
            }
        }

        let result = table.toElement();

        Views.setupCategoryLinks(result);
        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);

        return result;
    }

    export function createRecentThreadsView(threads: ThreadRepository.Thread[]): HTMLElement {

        let result = new DOMAppender('<div>', '</div>');

        for (let thread of threads) {

            if (null === thread) continue;

            let element = new DOMAppender('<div class="recent-thread">', '</div>');
            result.append(element);

            let score = DisplayHelpers.intToString(Math.abs(thread.voteScore));

            if (0 === thread.voteScore) {

                element.appendRaw(`<span class="thread-vote neutral-vote" aria-expanded="false">0</span>`);
            }
            else if (thread.voteScore < 0) {

                element.appendRaw(`<span class="thread-vote down-vote" aria-expanded="false">−${score}</span>`);
            }
            else {
                element.appendRaw(`<span class="thread-vote up-vote" aria-expanded="false">+${score}</span>`);
            }

            let user = new DOMAppender('<span class="author">', '</span>');
            element.append(user);

            let userLink = new DOMAppender(`<a ${UsersView.getThreadsOfUserLinkContent(thread.createdBy)}>`, '</a>');
            user.append(userLink);
            userLink.appendString(thread.createdBy.name);

            let title = DOMHelpers.escapeStringForAttribute(thread.name);

            let href = Pages.getThreadMessagesOfThreadUrlFull(thread);
            let data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;
            let link = new DOMAppender(`<a href="${href}" class="recent-thread-link" title="${title}" ${data}>`, '</a>');
            element.append(link);
            link.appendString(thread.name);
        }

        let resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);

        return resultElement;
    }

    export function createThreadPageHeader(thread: ThreadRepository.Thread): HTMLElement {

        let result = new DOMAppender('<div class="uk-container uk-container-expand thread-header">', '</div>');

        let card = new DOMAppender('<div class="uk-card uk-card-body">', '</div>');
        result.append(card);

        {
        /* append to card:
    <div class="thread-actions">
        <button class="uk-button uk-button-primary uk-button-small">Subscribe</button>
        <a uk-icon="icon: file-edit" href="editThreadTitle" title="Edit thread title" uk-tooltip></a>
        <a uk-icon="icon: tag" href="editThreadTags" title="Edit thread tags" uk-tooltip></a>
        <a uk-icon="icon: settings" href="editThreadPrivileges" title="Edit thread access" uk-tooltip
           uk-toggle="target: #privileges-modal"></a>
        <a uk-icon="icon: trash" href="deleteThread" title="Delete thread" uk-tooltip></a>
    </div>
        */
        }
        {
            let title = new DOMAppender(' <div class="uk-align-left thread-title">', '</div>');
            card.append(title);

            let threadTitle = new DOMAppender('<span class="uk-logo">', '</span>');
            title.append(threadTitle);
            threadTitle.appendString(thread.name);
            title.appendRaw(' ');

            let userLink = new DOMAppender(`<a class="author" ${UsersView.getThreadsOfUserLinkContent(thread.createdBy)}>`, '</a>');
            title.append(userLink);
            userLink.appendString(thread.createdBy.name);
        }
        {
            card.appendRaw('<div class="uk-clearfix"></div>');
        }
        {
            let details = new DOMAppender('<div class="thread-details uk-align-left">', '</div>');
            card.append(details);

            if (thread.tags && thread.tags.length){

                for (let tag of thread.tags) {

                    details.append(TagsView.createTagElement(tag));
                    details.appendRaw(' ');
                }
            }

            details.appendRaw('<span>Displayed under: </span>');
            if (thread.categories && thread.categories.length) {

                for (let category of thread.categories) {

                    let element = new DOMAppender('<a href="' +
                        Pages.getCategoryFullUrl(category) +
                        '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                        DOMHelpers.escapeStringForAttribute(category.name) + '">', '</a>');
                    details.append(element);
                    element.appendString(category.name);
                    details.appendRaw(' · ');
                }
            }
            else {

                details.appendRaw('<span class="uk-text-warning">&lt;none&gt;</span> · ');
            }
            details.appendRaw(`${DisplayHelpers.intToString(thread.visited)} total views · `);
            details.appendRaw(`<a href="subscribed">${DisplayHelpers.intToString(thread.subscribedUsersCount)} subscribed users</a>`);
        }
        {
            card.appendRaw('<div class="uk-clearfix"></div>');
        }
        let element = result.toElement();

        Views.setupThreadsWithTagsLinks(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupCategoryLinks(element);

        return element;
    }
}