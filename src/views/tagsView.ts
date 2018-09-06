import {TagRepository} from '../services/tagRepository';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {Views} from './common';
import {DOMHelpers} from '../helpers/domHelpers';
import {Pages} from '../pages/common';
import {PageActions} from '../pages/action';
import {Privileges} from '../services/privileges';
import {EditViews} from './edit';
import {PrivilegesView} from './privilegesView';
import {ThreadMessagesView} from './threadMessagesView';

export module TagsView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;

    export function createTagElement(tag: TagRepository.Tag): DOMAppender {

        const container = dA('<div class="uk-display-inline-block">');

        const tagElement = dA('<a class="uk-badge uk-icon" uk-icon="icon: tag" ' +
            getThreadsWithTagLinkContent(tag) + '>');
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
                                          callback: PageActions.ITagCallback): TagsPageContent {

        const result = new TagsPageContent();

        const resultList = cE("div");

        resultList.appendChild(result.sortControls = createTagListSortControls(info));

        if (Privileges.ForumWide.canAddNewTag()) {

            resultList.appendChild(createAddNewTagElement(callback));
        }

        const tagsList = cE('div');
        resultList.appendChild(tagsList);

        DOMHelpers.addClasses(tagsList, 'tags-list');
        tagsList.appendChild(this.createTagsTable(tags));

        if (Privileges.ForumWide.canAddNewTag()) {

            resultList.appendChild(createAddNewTagElement(callback));
        }

        result.list = resultList;
        return result;
    }

    export function createTagsTable(tags: TagRepository.Tag[]): HTMLElement {

        const tableContainer = dA('<div class="tags-table">');
        const table = dA('<table class="uk-table uk-table-divider uk-table-middle">');
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
        const tbody = dA('<tbody>');
        table.append(tbody);

        for (let tag of tags) {

            if (null == tag) continue;

            const row = dA('<tr>');
            tbody.append(row);
            {
                const nameColumn = dA('<td class="uk-table-expand">');
                row.append(nameColumn);

                nameColumn.append(dA('<span class="uk-icon" uk-icon="icon: tag">'));

                const nameLink = dA('<a class="uk-button uk-button-text" ' + getThreadsWithTagLinkContent(tag) + '>');
                nameColumn.append(nameLink);
                nameLink.appendString(' ' + tag.name);
                nameColumn.appendRaw('<br/>');

                if (tag.categories && tag.categories.length) {

                    const categoryElement = dA('<span class="category-children uk-text-small">');
                    nameColumn.appendRaw('<span class="uk-text-meta">Referenced by:</span> ');
                    nameColumn.append(categoryElement);

                    for (let i = 0; i < tag.categories.length; ++i) {

                        const category = tag.categories[i];

                        const element = dA('<a href="' +
                            Pages.getCategoryFullUrl(category) +
                            '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                            DOMHelpers.escapeStringForAttribute(category.name) + '">');
                        categoryElement.append(element);
                        element.appendString(category.name);

                        if (i < (tag.categories.length - 1)) {
                            categoryElement.appendRaw(' · ');
                        }
                    }
                }
            }
            {
                const statisticsColumn = ('<td class="tag-statistics uk-table-shrink">\n' +
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
                row.append(ThreadMessagesView.createLatestMessageColumnView(tag.latestMessage));
            }
        }

        const result = tableContainer.toElement();

        Views.setupCategoryLinks(result);
        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);

        Views.markElementForAnimatedDisplay(result, '.tags-table tbody');

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
                                        callback: PageActions.ITagCallback,
                                        privilegesCallback: PageActions.IPrivilegesCallback): HTMLElement {

        const container = cE('div');
        DOMHelpers.addClasses(container, 'uk-grid-small', 'tag-page-header');

        const badge = cE('span');

        if (Privileges.Tag.canEditTagName(tag)) {

            const link = EditViews.createEditLink('Edit tag name');
            container.appendChild(link);
            Views.onClick(link, () => {

                const name = EditViews.getInput('Edit tag name', tag.name);
                if (name && name.length && (name != tag.name)) {

                    EditViews.doIfOk(callback.editTagName(tag.id, name), () => {

                        badge.innerText = tag.name = name;
                    });
                }
            });
        }

        const badgeContainer = cE('div');
        container.appendChild(badgeContainer);
        DOMHelpers.addClasses(badgeContainer, 'uk-display-inline-block');

        badgeContainer.appendChild(badge);
        DOMHelpers.addClasses(badge, 'uk-badge', 'uk-icon');
        badge.setAttribute('uk-icon', 'icon: tag');
        badge.innerText = tag.name;

        if (Privileges.Tag.canMergeTags(tag)) {

            const link = EditViews.createEditLink('Merge tags', 'git-fork');
            container.appendChild(link);
            Views.onClick(link, async () => {

                const allTags = await callback.getAllTags();
                TagsView.showSelectSingleTagDialog(allTags, (selected: string) => {

                    EditViews.goToTagsPageIfOk(callback.mergeTags(tag.id, selected));
                });
            });
        }
        if (Privileges.Tag.canViewTagRequiredPrivileges(tag)
            || Privileges.Tag.canViewTagAssignedPrivileges(tag)) {

            const link = EditViews.createEditLink('Privileges', 'settings');
            container.appendChild(link);
            Views.onClick(link, async () => {

                PrivilegesView.showTagPrivileges(tag, privilegesCallback);
            });
        }

        const threadCount = cE('span');
        container.appendChild(threadCount);
        threadCount.innerText = `${DisplayHelpers.intToString(tag.threadCount)} threads`;

        const messageCount = cE('span');
        container.appendChild(messageCount);
        messageCount.innerText = `${DisplayHelpers.intToString(tag.messageCount)} messages`;

        container.appendChild(DOMHelpers.parseHTML('<span class="uk-text-meta">Referenced by: </span>'));

        if (tag.categories && tag.categories.length) {

            for (let i = 0; i < tag.categories.length; ++i) {

                const category = tag.categories[i];

                const element = cE('a');
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

        if (Privileges.Tag.canDeleteTag(tag)) {

            const deleteLink = EditViews.createDeleteLink('Delete tag');
            container.appendChild(deleteLink);

            Views.onClick(deleteLink, () => {

                if (EditViews.confirm(`Are you sure you want to delete the following tag: ${tag.name}?`)) {

                    EditViews.goToTagsPageIfOk(callback.deleteTag(tag.id));
                }
            });
        }

        Views.setupCategoryLinks(container);

        return container;
    }

    export function populateTagsInSelect(selectElement: HTMLSelectElement, tags: TagRepository.Tag[],
                                         selectedTags?: TagRepository.Tag[]) {

        selectElement.innerHTML = '';
        selectedTags = selectedTags || [];

        for (let tag of tags) {

            const option = cE('option');
            option.setAttribute('value', tag.id);
            option.innerText = tag.name;

            if (selectedTags.find((value) => {
                return value.id == tag.id;
            })) {

                option.setAttribute('selected', '');
            }

            selectElement.appendChild(option);
        }
    }

    export function createTagSelectionView(tags: TagRepository.Tag[], selectedTags?: TagRepository.Tag[]): HTMLDivElement {

        selectedTags = selectedTags || [];

        const result = cE('div') as HTMLDivElement;
        DOMHelpers.addClasses(result, 'tag-selection-container');

        for (let tag of tags) {

            const checkBox = cE('input') as HTMLInputElement;
            checkBox.type = 'checkbox';
            checkBox.setAttribute('value', tag.id);

            const label = cE('label') as HTMLLabelElement;
            result.appendChild(label);
            label.appendChild(checkBox);
            label.appendChild(document.createTextNode(tag.name));

            checkBox.checked = !! selectedTags.find((value) => {

                return value.id == tag.id;
            });
        }

        return result;
    }

    export function getSelectedTagIds(container: HTMLElement): string[] {

        const result: string[] = [];

        DOMHelpers.forEach(container.getElementsByTagName('input'), element => {

            const checkbox = element as HTMLInputElement;
            if (checkbox.checked) {

                result.push(checkbox.value);
            }
        });

        return result;
    }

    export function showSelectTagsDialog(currentTags: TagRepository.Tag[], allTags: TagRepository.Tag[],
                                         onSave: (added: string[], removed: string[]) => void): void {

        TagRepository.sortByName(allTags);

        const modal = document.getElementById('select-tags-modal');
        Views.showModal(modal);

        const saveButton = DOMHelpers.removeEventListeners(
            modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement);
        const selectFormElement = modal.getElementsByTagName('form')[0] as HTMLFormElement;

        const previousTagIds = new Set();
        for (let tag of currentTags) {

            previousTagIds.add(tag.id);
        }

        Views.onClick(saveButton, () => {

            const added = [], removed = [];

            for (const id of getSelectedTagIds(selectFormElement)) {

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

        selectFormElement.innerHTML = '';
        selectFormElement.appendChild(createTagSelectionView(allTags, currentTags));
    }

    export function showSelectSingleTagDialog(allTags: TagRepository.Tag[], onSave: (selected: string) => void): void {

        TagRepository.sortByName(allTags);

        const modal = document.getElementById('select-single-tag-modal');
        Views.showModal(modal);

        const saveButton = DOMHelpers.removeEventListeners(
            modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement);
        const selectElement = modal.getElementsByTagName('select')[0] as HTMLSelectElement;

        Views.onClick(saveButton, () => {

            const selected = selectElement.selectedOptions;
            if (selected.length) {

                const id = selected[0].getAttribute('value');
                onSave(id);
            }
        });

        populateTagsInSelect(selectElement, allTags);
    }

    function createAddNewTagElement(callback: PageActions.ITagCallback): HTMLElement {

        const button = EditViews.createAddNewButton('Add Tag');

        Views.onClick(button, () => {

            const name = EditViews.getInput('Enter the new tag name');
            if ((null === name) || (name.length < 1)) return;

            EditViews.reloadPageIfOk(callback.createTag(name));
        });

        return EditViews.wrapAddElements(button);
    }
}
