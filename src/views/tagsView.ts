import {TagRepository} from "../services/tagRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {UsersView} from "./usersView";
import {ThreadRepository} from "../services/threadRepository";

export module TagsView {

    import DOMAppender = DOMHelpers.DOMAppender;

    export function createTagElement(tag: TagRepository.Tag): DOMAppender {

        let container = new DOMAppender('<div class="uk-display-inline-block">', '</div>');

        let tagElement = new DOMAppender('<a class="uk-badge uk-icon" uk-icon="icon: tag" ' +
            getThreadsWithTagLinkContent(tag) + '>', '</a>');
        container.append(tagElement);
        tagElement.appendString(tag.name);

        return container;
    }

    export function getThreadsWithTagLinkContent(tag: TagRepository.Tag): string {

        return 'href="' + Pages.getThreadsWithTagUrlFull(tag) + '" ' + Views.ThreadsWithTagData + '="' +
            DOMHelpers.escapeStringForAttribute(tag.name) + '"';
    }

    export class TagsPageContent {

        sortControls: HTMLElement;
        list: HTMLElement
    }

    export function createTagsPageContent(tags: TagRepository.Tag[], info: Views.SortInfo): TagsPageContent {

        let result = new TagsPageContent();

        let resultList = $("<div></div>");

        resultList.append(result.sortControls = createTagListSortControls(info));

        let tagsList = $('<div class="tags-list"></div>');
        resultList.append(tagsList);
        tagsList.append(this.createTagsTable(tags));

        result.list = resultList[0];
        return result;
    }

    export function createTagsTable(tags: TagRepository.Tag[]): HTMLElement {

        let tableContainer = new DOMAppender('<div class="tags-table">', '</div>');
        let table = new DOMAppender('<table class="uk-table uk-table-divider uk-table-middle">', '</table>');
        tableContainer.append(table);

        if (tags.length < 1) {

            table.appendRaw('<span class="uk-text-warning">No tags found</span>');
            return tableContainer.toElement();
        }

        const tableHeader = '<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Tag</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);
        let tbody = new DOMAppender('<tbody>', '</tbody>');
        table.append(tbody);

        for (let tag of tags) {

            if (null == tag) continue;

            let row = new DOMAppender('<tr>', '</tr>');
            tbody.append(row);
            {
                let nameColumn = new DOMAppender('<td class="uk-table-expand">', '</td>');
                row.append(nameColumn);

                nameColumn.append(new DOMAppender('<span class="uk-icon" uk-icon="icon: tag">', '</span>'));

                let nameLink = new DOMAppender('<a class="uk-button uk-button-text" ' + getThreadsWithTagLinkContent(tag) + '>', '</a>');
                nameColumn.append(nameLink);
                nameLink.appendString(' ' + tag.name);
                nameColumn.appendRaw('<br/>');

                if (tag.categories && tag.categories.length) {

                    let categoryElement = new DOMAppender('<span class="category-children uk-text-small">', '</span>');
                    nameColumn.appendRaw('<span class="uk-text-meta">Referenced by:</span> ');
                    nameColumn.append(categoryElement);

                    for (let i = 0; i < tag.categories.length; ++i) {

                        let category = tag.categories[i];

                        let element = new DOMAppender('<a href="' +
                            Pages.getCategoryFullUrl(category) +
                            '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                            DOMHelpers.escapeStringForAttribute(category.name) + '">', '</a>');
                        categoryElement.append(element);
                        element.appendString(category.name);

                        if (i < (tag.categories.length - 1)) {
                            categoryElement.appendRaw(' · ');
                        }
                    }
                }
            }
            {
                let statisticsColumn = ('<td class="tag-statistics uk-table-shrink">\n' +
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
                    .replace('{nrOfThreads}', DisplayHelpers.intToString(tag.threadCount))
                    .replace('{nrOfMessages}', DisplayHelpers.intToString(tag.messageCount));
                row.appendRaw(statisticsColumn);
            }
            {
                let latestMessageColumn = new DOMAppender('<td class="latest-message uk-text-center">', '</td>');
                row.append(latestMessageColumn);

                const latestMessage = tag.latestMessage;

                if (latestMessage) {

                    latestMessageColumn.append(UsersView.createUserLogoSmall(latestMessage.createdBy));
                    latestMessageColumn.append(UsersView.createAuthorSmall(latestMessage.createdBy));

                    let threadTitle = latestMessage.threadName || 'unknown';

                    let href = Pages.getThreadMessagesOfThreadUrlFull({
                        id: latestMessage.threadId,
                        name: latestMessage.threadName
                    } as ThreadRepository.Thread);

                    let data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(latestMessage.threadId)}"`;

                    let threadTitleElement = $(`<a class="recent-message-thread-link" href="${href}" ${data}></a>`);
                    threadTitleElement.text(threadTitle);
                    threadTitleElement.attr('title', threadTitle);
                    latestMessageColumn.appendElement(threadTitleElement[0]);

                    let recentMessageTime = new DOMAppender('<div class="recent-message-time uk-text-meta">', '</div>');
                    latestMessageColumn.append(recentMessageTime);

                    let recentMessageTimeContent = document.createElement('span');
                    recentMessageTimeContent.innerText = DisplayHelpers.getDateTime(latestMessage.created);
                    recentMessageTime.appendElement(recentMessageTimeContent);

                    let messageContent = latestMessage.content || 'empty';

                    href = Pages.getThreadMessagesOfMessageParentThreadUrlFull(latestMessage.id);
                    data = `data-threadmessagemessageid="${DOMHelpers.escapeStringForAttribute(latestMessage.id)}"`;

                    let messageLink = $(`<a class="recent-message-link no-math" href="${href}" ${data}></a>`);
                    messageLink.text(messageContent);
                    messageLink.attr('title', messageContent);
                    latestMessageColumn.appendElement(messageLink[0]);
                }
            }
        }

        let result = tableContainer.toElement();

        Views.setupCategoryLinks(result);
        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);

        return result;
    }

    function createTagListSortControls(info: Views.SortInfo): HTMLElement {

        return $('<div class="tags-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="order-by">\n' +
            '                Sort by:\n' +
            Views.createOrderByLabel('name', 'Name', info) +
            Views.createOrderByLabel('threadcount', 'Thread Count', info) +
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

    function createTagInList(tag: TagRepository.Tag): DOMAppender {

        let result = new DOMAppender('<div>', '</div>');

        let card = new DOMAppender('<div class="uk-card uk-card-default uk-card-body">', '</div>');
        result.append(card);

        let wrapper = new DOMAppender('<div class="tag-in-list">', '</div>');
        card.append(wrapper);

        wrapper.append(createTagElement(tag));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a ' + getThreadsWithTagLinkContent(tag) + '>Threads</a></div>\n' +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(tag.threadCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Messages</div>\n' +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(tag.messageCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Added</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span>{Added}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{Added}', DisplayHelpers.getDateTime(tag.created)));

        return result;
    }

    export function createTagPageHeader(tag: TagRepository.Tag): HTMLElement {

        let container = new DOMAppender('<div class="uk-grid-small tag-page-header">', '</div>');

        container.appendRaw(('<div class="uk-display-inline-block">\n' +
            '    <span class="uk-badge uk-icon" uk-icon="icon: tag">{tagName}</span>\n' +
            '</div>').replace('{tagName}', DOMHelpers.escapeStringForContent(tag.name)));

        container.appendRaw('<span>{threadCount} threads</span>'
            .replace('{threadCount}', DisplayHelpers.intToString(tag.threadCount)));

        container.appendRaw('<span>{messageCount} messages</span>'
            .replace('{messageCount}', DisplayHelpers.intToString(tag.messageCount)));

        container.appendRaw('<span class="uk-text-meta">Referenced by: </span>');
        if (tag.categories && tag.categories.length) {

            for (let i = 0; i < tag.categories.length; ++i) {

                const category = tag.categories[i];

                let element = new DOMAppender('<a href="' +
                    Pages.getCategoryFullUrl(category) +
                    '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                    DOMHelpers.escapeStringForAttribute(category.name) + '">', '</a>');
                container.append(element);
                element.appendString(category.name);

                if (i < (tag.categories.length - 1)) {
                    container.appendRaw(', ');
                }
            }
        }

        let element = container.toElement();

        Views.setupCategoryLinks(element);

        return element;
    }
}
