import {CategoryRepository} from "../services/categoryRepository";
import {TagsView} from "./tagsView";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";

export module CategoriesView {

    export function createCategoriesTable(categories: CategoryRepository.Category[]): HTMLElement {

        let tableContainer = $('<div class="categories-table"></div>');
        let table = $('<table class="uk-table uk-table-divider uk-table-middle"></table>');
        tableContainer.append(table);

        let tableHeader = $('<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Category</th>\n' +
            '        <th class="uk-text-center category-tags-header uk-table-shrink">Tags</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>');
        table.append(tableHeader);
        let tbody = $('<tbody></tbody>');
        table.append(tbody);

        for (let category of categories) {

            if (null == category) continue;

            let row = $('<tr></tr>');
            tbody.append(row);
            {
                let nameColumn = $('<td class="uk-table-expand"></td>');
                row.append(nameColumn);

                nameColumn.append($('<span class="uk-icon" uk-icon="icon: folder"></span>'));
                let nameLink = $('<a class="uk-button uk-button-text" href="#"></a>');
                nameColumn.append(nameLink);
                nameLink.text(' ' + category.name);
                nameColumn.append($('<br/>'));
                let description = $('<span class="category-description uk-text-meta"></span>');
                nameColumn.append(description);
                description.text(category.description);
            }
            {
                let tagColumn = $('<td class="uk-text-center uk-table-shrink"></td>');
                row.append(tagColumn);

                for (let tag of category.tags) {

                    if (null == tag) continue;

                    tagColumn.append(TagsView.createTagElement(tag));
                    tagColumn.append('\n');
                }
            }
            {
                let statisticsColumn = $(('<td class="category-statistics uk-table-shrink">\n' +
                    '    <table>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfThreads}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">threads</td>\n' +
                    '        </tr>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfMessages}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">messages</td>\n' +
                    '        </tr>\n' +
                    '    </table>\n' +
                    '</td>')
                    .replace('{nrOfThreads}', DisplayHelpers.intToString(category.threadTotalCount))
                    .replace('{nrOfMessages}', DisplayHelpers.intToString(category.messageTotalCount)));
                row.append(statisticsColumn);
            }
            {
                let latestMessageColumn = $('<td class="latest-message uk-text-center"></td>');
                row.append(latestMessageColumn);

                const latestMessage = category.latestMessage;

                latestMessageColumn.append(UsersView.createUserLogoSmall(latestMessage.createdBy));
                latestMessageColumn.append(UsersView.createAuthorSmallWithColon(latestMessage.createdBy));

                let threadTitle = latestMessage.threadName || 'unknown';

                let threadTitleElement = $('<a class="recent-message-thread-link" href="#" uk-tooltip></a>');
                latestMessageColumn.append(threadTitleElement);
                threadTitleElement.text(threadTitle);
                threadTitleElement.attr('title', threadTitle);

                let recentMessageTime = $('<div class="recent-message-time uk-text-meta"></div>');
                latestMessageColumn.append(recentMessageTime);

                let recentMessageTimeContent = $('<span uk-tooltip></span>');
                recentMessageTime.append(recentMessageTimeContent);
                recentMessageTimeContent.text(DisplayHelpers.getAgoTime(latestMessage.created));
                recentMessageTimeContent.attr('title', DisplayHelpers.getFullDateTime(latestMessage.created));

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