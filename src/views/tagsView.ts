import {TagRepository} from "../services/tagRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {UsersView} from "./usersView";
import {ThreadRepository} from "../services/threadRepository";
import {PageActions} from "../pages/action";
import {Privileges} from "../services/privileges";
import {EditViews} from "./edit";

export module TagsView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import ITagCallback = PageActions.ITagCallback;
    import ITagPrivileges = Privileges.ITagPrivileges;

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

    export function createTagsPageContent(tags: TagRepository.Tag[], info: Views.SortInfo,
                                          callback: ITagCallback,
                                          privileges: ITagPrivileges): TagsPageContent {

        let result = new TagsPageContent();

        let resultList = document.createElement("div");

        resultList.appendChild(result.sortControls = createTagListSortControls(info));

        if (privileges.canAddNewTag()) {

            resultList.appendChild(createAddNewTagElement(callback));
        }

        let tagsList = document.createElement('div');
        resultList.appendChild(tagsList);

        tagsList.classList.add('tags-list');
        tagsList.appendChild(this.createTagsTable(tags));

        if (privileges.canAddNewTag()) {

            resultList.appendChild(createAddNewTagElement(callback));
        }

        result.list = resultList;
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

                    let threadTitleElement = document.createElement('a');
                    threadTitleElement.classList.add('recent-message-thread-link');
                    threadTitleElement.setAttribute('href', href);
                    threadTitleElement.setAttribute('title', threadTitle);
                    threadTitleElement.setAttribute('data-threadmessagethreadid', latestMessage.threadId);
                    threadTitleElement.innerText = threadTitle;
                    latestMessageColumn.appendElement(threadTitleElement);

                    let recentMessageTime = new DOMAppender('<div class="recent-message-time uk-text-meta">', '</div>');
                    latestMessageColumn.append(recentMessageTime);

                    let recentMessageTimeContent = document.createElement('span');
                    recentMessageTimeContent.innerText = DisplayHelpers.getDateTime(latestMessage.created);
                    recentMessageTime.appendElement(recentMessageTimeContent);

                    let messageContent = latestMessage.content || 'empty';

                    let messageLink = document.createElement('a');
                    messageLink.classList.add('recent-message-link', 'no-math');
                    messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(latestMessage.id));
                    messageLink.setAttribute('title', messageContent);
                    messageLink.setAttribute('data-threadmessagemessageid', latestMessage.id);
                    messageLink.innerText = messageContent;
                    latestMessageColumn.appendElement(messageLink);
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

        return DOMHelpers.parseHTML('<div class="tags-list-header">\n' +
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
            '</div>');
    }

    export function createTagPageHeader(tag: TagRepository.Tag,
                                        callback: ITagCallback,
                                        privileges: ITagPrivileges): HTMLElement {

        let container = document.createElement('div');
        container.classList.add('uk-grid-small', 'tag-page-header');

        let badge = document.createElement('span');

        if (privileges.canEditTagName(tag.id)) {

            let link = EditViews.createEditLink('Edit tag name');
            container.appendChild(link);
            link.addEventListener('click', () => {

                const name = EditViews.getInput('Edit tag name', tag.name);
                if (name && name.length && (name != tag.name)) {

                    EditViews.doIfOk(callback.editTagName(tag.id, name), () => {

                        badge.innerText = tag.name = name;
                    });
                }
            });
        }

        let badgeContainer = document.createElement('div');
        container.appendChild(badgeContainer);
        badgeContainer.classList.add('uk-display-inline-block');

        badgeContainer.appendChild(badge);
        badge.classList.add('uk-badge', 'uk-icon');
        badge.setAttribute('uk-icon', 'icon: tag');
        badge.innerText = tag.name;

        if (privileges.canMergeTags(tag.id)) {

            let link = EditViews.createEditLink('Merge tags', 'git-fork');
            container.appendChild(link);
            link.addEventListener('click', async () => {

                const allTags = await callback.getAllTags();
                TagsView.showSelectSingleTagDialog(allTags, (selected: string) => {

                    EditViews.goToTagsPageIfOk(callback.mergeTags(tag.id, selected));
                });
            });
        }

        let threadCount = document.createElement('span');
        container.appendChild(threadCount);
        threadCount.innerText = `${DisplayHelpers.intToString(tag.threadCount)} threads`;

        let messageCount = document.createElement('span');
        container.appendChild(messageCount);
        messageCount.innerText = `${DisplayHelpers.intToString(tag.messageCount)} messages`;

        container.appendChild(DOMHelpers.parseHTML('<span class="uk-text-meta">Referenced by: </span>'));

        if (tag.categories && tag.categories.length) {

            for (let i = 0; i < tag.categories.length; ++i) {

                const category = tag.categories[i];

                let element = document.createElement('a');
                container.appendChild(element);

                element.setAttribute('href', Pages.getCategoryFullUrl(category));
                element.setAttribute('data-categoryid', category.id);
                element.setAttribute('data-categoryname', category.name);
                element.innerText = category.name;

                if (i < (tag.categories.length - 1)) {
                    container.appendChild(document.createTextNode(', '));
                }
            }
        }

        if (privileges.canDeleteTag(tag.id)) {

            let deleteLink = EditViews.createDeleteLink('Delete tag');
            container.appendChild(deleteLink);

            deleteLink.addEventListener('click', () => {

                if (EditViews.confirm(`Are you sure you want to delete the following tag: ${tag.name}?`)) {

                    EditViews.goToTagsPageIfOk(callback.deleteTag(tag.id));
                }
            });
        }

        Views.setupCategoryLinks(container);

        return container;
    }

    export function showSelectTagsDialog(currentTags: TagRepository.Tag[], allTags: TagRepository.Tag[],
                                         onSave: (added: string[], removed: string[]) => void): void {

        TagRepository.sortByName(allTags);

        let modal = document.getElementById('select-tags-modal');
        Views.showModal(modal);

        let saveButton = modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement;
        let selectElement = modal.getElementsByTagName('select')[0] as HTMLSelectElement;

        let previousTagIds = new Set();
        for (let tag of currentTags) {

            previousTagIds.add(tag.id);
        }

        saveButton = DOMHelpers.removeEventListeners(saveButton);
        saveButton.addEventListener('click', (ev) => {

            ev.preventDefault();

            let selected = selectElement.selectedOptions;
            let added = [], removed = [];

            for (let i = 0; i < selected.length; ++i) {

                const id = selected[i].getAttribute('value');

                if (previousTagIds.has(id)) {

                    previousTagIds.delete(id);
                }
                else {
                    added.push(id);
                }
            }
            previousTagIds.forEach((value) => {

                removed.push(value);
            });

            onSave(added, removed);
        });

        selectElement.innerHTML = '';

        for (let tag of allTags) {

            let option = document.createElement('option');
            option.setAttribute('value', tag.id);
            option.innerText = tag.name;

            if (currentTags.find((value) => {
                    return value.id == tag.id;
                })) {

                option.setAttribute('selected', '');
            }

            selectElement.appendChild(option);
        }
    }

    export function showSelectSingleTagDialog(allTags: TagRepository.Tag[], onSave: (selected: string) => void): void {

        TagRepository.sortByName(allTags);

        let modal = document.getElementById('select-single-tag-modal');
        Views.showModal(modal);

        let saveButton = modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement;
        let selectElement = modal.getElementsByTagName('select')[0] as HTMLSelectElement;

        saveButton = DOMHelpers.removeEventListeners(saveButton);
        saveButton.addEventListener('click', (ev) => {

            ev.preventDefault();

            let selected = selectElement.selectedOptions;
            if (selected.length) {

                const id = selected[0].getAttribute('value');
                onSave(id);
            }
        });

        selectElement.innerHTML = '';

        for (let tag of allTags) {

            let option = document.createElement('option');
            option.setAttribute('value', tag.id);
            option.innerText = tag.name;

            selectElement.appendChild(option);
        }
    }

    function createAddNewTagElement(callback: ITagCallback): HTMLElement {

        let button = EditViews.createAddNewButton('Add Tag');

        button.addEventListener('click', () => {

            const name = EditViews.getInput('Enter the new tag name');
            if (name.length < 1) return;

            EditViews.reloadPageIfOk(callback.createTag(name));
        });

        return EditViews.wrapAddElements(button);
    }
}
