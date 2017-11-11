import {CategoryRepository} from "../services/categoryRepository";
import {TagsView} from "./tagsView";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {DOMHelpers} from "../helpers/domHelpers";

export module CategoriesView {

    import DOMAppender = DOMHelpers.DOMAppender;

    export function createCategoriesTable(categories: CategoryRepository.Category[]): HTMLElement {

        let tableContainer = new DOMAppender('<div class="categories-table">','</div>');
        let table = new DOMAppender('<table class="uk-table uk-table-divider uk-table-middle">', '</table>');
        tableContainer.append(table);

        const tableHeader = '<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Category</th>\n' +
            '        <th class="uk-text-center category-tags-header uk-table-shrink">Tags</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);
        let tbody = new DOMAppender('<tbody>', '</tbody>');
        table.append(tbody);

        for (let category of categories) {

            if (null == category) continue;

            let row = new DOMAppender('<tr>', '</tr>');
            tbody.append(row);
            {
                let nameColumn = new DOMAppender('<td class="uk-table-expand">', '</td>');
                row.append(nameColumn);

                nameColumn.append(new DOMAppender('<span class="uk-icon" uk-icon="icon: folder">', '</span>'));

                let nameLink = new DOMAppender('<a class="uk-button uk-button-text" href="#">', '</a>');
                nameColumn.append(nameLink);
                nameLink.appendString(' ' + category.name);
                nameColumn.appendRaw('<br/>');

                let description = new DOMAppender('<span class="category-description uk-text-meta">', '</span>');
                nameColumn.append(description);
                description.appendString(category.description);

                if (category.children && category.children.length) {

                    let childCategoryElement = new DOMAppender('<span class="category-children uk-text-small">', '</span>');
                    nameColumn.appendRaw(' ');
                    nameColumn.append(childCategoryElement);

                    for (let i = 0; i < category.children.length; ++i) {

                        let childCategory = category.children[i];

                        let element = new DOMAppender('<a>', '</a>');
                        childCategoryElement.append(element);
                        element.appendString(childCategory.name);

                        if (i < (category.children.length - 1)) {
                            childCategoryElement.appendRaw(' · ');
                        }
                    }
                }
            }
            {
                let tagColumn = new DOMAppender('<td class="uk-text-center uk-table-shrink">', '</td>');
                row.append(tagColumn);

                for (let tag of category.tags) {

                    if (null == tag) continue;

                    tagColumn.append(TagsView.createTagElement(tag));
                    tagColumn.appendRaw('\n');
                }
            }
            {
                let statisticsColumn = ('<td class="category-statistics uk-table-shrink">\n' +
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
                    .replace('{nrOfMessages}', DisplayHelpers.intToString(category.messageTotalCount));
                row.appendRaw(statisticsColumn);
            }
            {
                let latestMessageColumn = new DOMAppender('<td class="latest-message uk-text-center">', '</td>');
                row.append(latestMessageColumn);

                const latestMessage = category.latestMessage;

                latestMessageColumn.append(UsersView.createUserLogoSmall(latestMessage.createdBy));
                latestMessageColumn.append(UsersView.createAuthorSmallWithColon(latestMessage.createdBy));

                let threadTitle = latestMessage.threadName || 'unknown';

                let threadTitleElement = $('<a class="recent-message-thread-link" href="#" uk-tooltip></a>');
                threadTitleElement.text(threadTitle);
                threadTitleElement.attr('title', threadTitle);
                latestMessageColumn.appendElement(threadTitleElement[0]);

                let recentMessageTime = new DOMAppender('<div class="recent-message-time uk-text-meta">', '</div>');
                latestMessageColumn.append(recentMessageTime);

                let recentMessageTimeContent = $('<span uk-tooltip></span>');
                recentMessageTimeContent.text(DisplayHelpers.getAgoTime(latestMessage.created));
                recentMessageTimeContent.attr('title', DisplayHelpers.getFullDateTime(latestMessage.created));
                recentMessageTime.appendElement(recentMessageTimeContent[0]);

                let messageContent = latestMessage.content || 'empty';

                let messageLink = $('<a class="recent-message-link" href="#" uk-tooltip></a>');
                messageLink.text(messageContent);
                messageLink.attr('title', messageContent);
                latestMessageColumn.appendElement(messageLink[0]);
            }
        }

        return tableContainer.toElement();
    }
}