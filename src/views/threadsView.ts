import {ThreadRepository} from "../services/threadRepository";
import {Views} from "./common";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {TagsView} from "./tagsView";

export module ThreadsView {

    export class ThreadsPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement
    }

    export function createThreadsPageContent(collection: ThreadRepository.ThreadCollection,
                                           onPageNumberChange: Views.PageNumberChangeCallback) {

        collection = collection || ThreadRepository.defaultThreadCollection();

        let result = new ThreadsPageContent();

        let resultList = $("<div></div>");

        resultList.append(result.sortControls = createThreadListSortControls());
        resultList.append(result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange));

        resultList.append(createThreadsTable(collection.threads));

        resultList.append(result.paginationBottom = Views.createPaginationControl(collection, null));

        result.list = resultList[0];
        return result;
    }

    function createThreadListSortControls(): HTMLElement {

        return $('<div class="threads-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="threads-list-sort-order">\n' +
            '                Sort by:\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="name" checked> Name</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="created"> Created</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="lastupdated"> Last Updated</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="messagecount"> Message Count</label>\n' +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            '                    <option value="ascending">Ascending</option>\n' +
            '                    <option value="descending">Descending</option>\n' +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>')[0];
    }

    export function createThreadsTable(threads: ThreadRepository.Thread[]): HTMLElement {

        let tableContainer = $('<div class="threads-table"></div>');
        let table = $('<table class="uk-table uk-table-divider uk-table-middle"></table>');
        tableContainer.append(table);

        let tableHeader = $('<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Thread</th>\n' +
            '        <th class="uk-text-center thread-created-header uk-table-shrink">Added</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>');
        table.append(tableHeader);
        let tbody = $('<tbody></tbody>');
        table.append(tbody);

        for (let thread of threads) {

            if (null == thread) continue;

            let row = $('<tr></tr>');
            tbody.append(row);
            {
                let nameColumn = $('<td class="uk-table-expand"></td>');
                row.append(nameColumn);

                const iconClass = thread.visitedSinceLastChange ? 'uk-icon' : 'uk-icon-button';
                const icon = thread.pinned ? 'star' : 'forward';
                nameColumn.append($(`<span class="${iconClass}" uk-icon="icon: ${icon}"></span>`));

                let threadLink = $('<a class="uk-button uk-button-text" href="#"></a>');
                nameColumn.append(threadLink);
                threadLink.text(' ' + thread.name);

                let details = $('<div class="thread-tags"></div>');
                nameColumn.append(details);

                if (thread.voteScore < 0) {
                    details.append($(`<span class="uk-label thread-score-down">− ${DisplayHelpers.intToString(thread.voteScore)}</span>`));
                }
                else if (thread.voteScore == 0) {
                    details.append($(`<span class="uk-label thread-score-up">0</span>`));
                }
                else {
                    details.append($(`<span class="uk-label thread-score-up">+ ${DisplayHelpers.intToString(thread.voteScore)}</span>`));
                }
                details.append(' ');

                for (let tag of thread.tags) {

                    if (null == tag) continue;

                    details.append(TagsView.createTagElement(tag));
                    details.append(' ');
                }
            }
            {
                let tagColumn = $('<td class="thread-created uk-text-center uk-table-shrink"></td>');
                row.append(tagColumn);

                tagColumn.append(UsersView.createUserLogoSmall(thread.createdBy));
                tagColumn.append(UsersView.createAuthorSmall(thread.createdBy));

                tagColumn.append($(('<div class="thread-message-time uk-text-meta">\n' +
                    '    <span title="{AddedExpanded}" uk-tooltip>{AddedAgo}</span>\n' +
                    '</div>')
                        .replace('{AddedExpanded}', DisplayHelpers.getFullDateTime(thread.created))
                        .replace('{AddedAgo}', DisplayHelpers.getAgoTimeShort(thread.created))));
            }
            {
                let statisticsColumn = $(('<td class="thread-statistics uk-table-shrink">\n' +
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
                    .replace('{nrOfSubscribed}', DisplayHelpers.intToString(thread.subscribedUsersCount))
                );
                row.append(statisticsColumn);
            }
            {
                let latestMessageColumn = $('<td class="latest-message uk-text-center"></td>');
                row.append(latestMessageColumn);

                const latestMessage = thread.latestMessage;

                latestMessageColumn.append(UsersView.createUserLogoSmall(latestMessage.createdBy));

                let authorElement = $(UsersView.createAuthorSmallWithColon(latestMessage.createdBy));
                latestMessageColumn.append(authorElement);

                let recentMessageTime = $('<span class="uk-text-meta" uk-tooltip></span>');
                authorElement.append(recentMessageTime);

                recentMessageTime.text(DisplayHelpers.getAgoTimeShort(latestMessage.created));
                recentMessageTime.attr('title', DisplayHelpers.getFullDateTime(latestMessage.created));

                let messageContent = latestMessage.content || 'empty';

                let messageLink = $('<a class="recent-message-link" href="#" uk-tooltip></a>');
                latestMessageColumn.append(messageLink);
                messageLink.text(messageContent);
                messageLink.attr('title', messageContent);
            }
        }

        return tableContainer[0];
    }
}