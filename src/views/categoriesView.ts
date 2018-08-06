import {CategoryRepository} from "../services/categoryRepository";
import {TagsView} from "./tagsView";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {DOMHelpers} from "../helpers/domHelpers";
import {Views} from "./common";
import {Pages} from "../pages/common";
import {ThreadRepository} from "../services/threadRepository";
import {PageActions} from "../pages/action";
import {Privileges} from "../services/privileges";
import {EditViews} from "./edit";
import {TagRepository} from "../services/tagRepository";
import {PrivilegesView} from "./privilegesView";
import {ThreadMessagesView} from "./threadMessagesView";

export module CategoriesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import ICategoryCallback = PageActions.ICategoryCallback;
    import reloadIfOk = EditViews.reloadPageIfOk;
    import doIfOk = EditViews.doIfOk;
    import IPrivilegesCallback = PageActions.IPrivilegesCallback;

    export function createCategoryLink(category: CategoryRepository.Category,
                                       addSpace: boolean = false,
                                       classes: string = 'uk-button uk-button-text'): DOMAppender {

        let result = new DOMAppender(`<a class="${classes}" href="` + Pages.getCategoryFullUrl(category) +
            '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
            DOMHelpers.escapeStringForAttribute(category.name) + '">', '</a>');

        result.appendString((addSpace ? ' ' : '') + category.name);

        return result;
    }

    export function createCategoriesTable(categories: CategoryRepository.Category[],
                                          callback: ICategoryCallback): HTMLElement {

        let tableContainer = new DOMAppender('<div class="categories-table">', '</div>');
        let table = new DOMAppender('<table class="uk-table uk-table-divider uk-table-middle">', '</table>');
        tableContainer.append(table);

        if (categories.length < 1) {

            table.appendRaw('<span class="uk-text-warning">No categories found</span>');
            return tableContainer.toElement();
        }

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

                if (Privileges.Category.canEditCategoryDisplayOrder(category)) {

                    const attributes = {
                        'data-category-id': category.id,
                        'data-category-display-order': category.displayOrder.toString()
                    };
                    const dataAttribute = DOMHelpers.concatAttributes(attributes);
                    const link = new DOMAppender(`<a class="editDisplayOrderLink" ${dataAttribute}>`, '</a>');
                    nameColumn.append(link);
                    link.append(new DOMAppender('<span class="uk-icon" uk-icon="icon: move" uk-tooltip title="Edit category display order">', '</span>'))
                }
                else {

                    nameColumn.append(new DOMAppender('<span class="uk-icon" uk-icon="icon: folder">', '</span>'));
                }

                let nameLink = createCategoryLink(category, true);
                nameColumn.append(nameLink);
                nameColumn.appendRaw('<br/>');

                let description = new DOMAppender('<span class="category-description">', '</span>');
                nameColumn.append(description);
                description.appendString(category.description);

                if (category.children && category.children.length) {

                    let childCategoryElement = new DOMAppender('<span class="category-children uk-text-small">', '</span>');
                    if (category.description && category.description.length) {
                        nameColumn.appendRaw('<span class="uk-text-meta"> · Subcategories:</span> ');
                    }
                    else {
                        nameColumn.appendRaw('<span class="uk-text-meta">Subcategories:</span> ');
                    }
                    nameColumn.append(childCategoryElement);

                    for (let i = 0; i < category.children.length; ++i) {

                        let childCategory = category.children[i];

                        let element = createCategoryLink(childCategory, false, '');
                        childCategoryElement.append(element);

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
                row.append(ThreadMessagesView.createLatestMessageColumnView(category.latestMessage));
            }
        }

        let result = tableContainer.toElement();

        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadsOfUsersLinks(result);
        Views.setupSubscribedThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);
        Views.setupCategoryLinks(result);

        setupEditCategoryDisplayCategories(result, callback);

        return result;
    }

    export function createCategoryHeader(category: CategoryRepository.Category,
                                         callback: ICategoryCallback,
                                         privilegesCallback: IPrivilegesCallback): HTMLElement {

        let result = document.createElement('div');
        result.classList.add('categories-list-header');

        if (Privileges.Category.canDeleteCategory(category)) {

            let deleteLink = EditViews.createDeleteLink('Delete category');
            result.appendChild(deleteLink);

            deleteLink.addEventListener('click', () => {

                if (EditViews.confirm(`Are you sure you want to delete the following category: ${category.name}?`)) {

                    EditViews.goToHomePageIfOk(callback.deleteCategory(category.id));
                }
            });
        }

        let breadcrumbsList = document.createElement('ul');
        result.appendChild(breadcrumbsList);
        breadcrumbsList.classList.add('uk-breadcrumb');

        function addToBreadCrumbs(value: CategoryRepository.Category): void {

            if (value.parent) addToBreadCrumbs(value.parent);

            let element = document.createElement('li');
            breadcrumbsList.appendChild(element);

            let link = document.createElement('a');
            element.appendChild(link);

            link.href = Pages.getCategoryFullUrl(value);

            link.appendChild(document.createTextNode(value.name));
            if (value.description && value.description.length) {

                link.setAttribute('title', value.description);
                link.setAttribute('uk-tooltip', '');
            }

            link.setAttribute('data-categoryid', value.id);
            link.setAttribute('data-categoryname', value.name);

            Views.setupCategoryLink(link);
        }

        if (category.parent) {
            addToBreadCrumbs(category.parent);
        }

        //add the current element also
        let element = document.createElement('li');
        breadcrumbsList.appendChild(element);

        let nameElement = document.createElement('span');
        nameElement.innerText = category.name;

        if (Privileges.Category.canEditCategoryParent(category)) {

            let link = EditViews.createEditLink('Edit category parent', 'git-branch');
            element.appendChild(link);
            link.addEventListener('click', async () => {

                const allCategories = await CategoryRepository.getAllCategoriesAsTree();

                let parentId = category.parentId;
                if (category.parent) {

                    parentId = category.parent.id;
                }
                else {

                    parentId = category.parentId;
                }
                parentId = parentId || CategoryRepository.EmptyCategoryId;

                showSelectCategoryParentDialog(allCategories, parentId, (newParentId) => {

                    reloadIfOk(callback.editCategoryParent(category.id, newParentId));
                });
            });
        }

        if (Privileges.Category.canEditCategoryName(category)) {

            let link = EditViews.createEditLink('Edit category name');
            element.appendChild(link);
            link.addEventListener('click', () => {

                const name = EditViews.getInput('Edit category name', category.name);
                if (name && name.length && (name != category.name)) {

                    doIfOk(callback.editCategoryName(category.id, name), () => {

                        nameElement.innerText = category.name = name;
                    });
                }
            });
        }

        element.appendChild(nameElement);

        let descriptionContainer = document.createElement('span');
        element.appendChild(descriptionContainer);
        descriptionContainer.classList.add('category-description');

        let descriptionElement = document.createElement('span');
        descriptionElement.innerText = category.description || '';
        descriptionElement.classList.add('uk-text-meta');

        if (Privileges.Category.canEditCategoryDescription(category)) {

            let link = EditViews.createEditLink('Edit category description');
            descriptionContainer.appendChild(link);
            link.addEventListener('click', () => {

                const description = EditViews.getInput('Edit category description', category.description);
                if (description && description.length && (description != category.description)) {

                    doIfOk(callback.editCategoryDescription(category.id, description), () => {

                        descriptionElement.innerText = category.description = description;
                    });
                }
            });
        }
        if (Privileges.Category.canViewCategoryRequiredPrivileges(category)
            || Privileges.Category.canViewCategoryAssignedPrivileges(category)) {

            let link = EditViews.createEditLink('Privileges', 'settings');
            result.appendChild(link);

            link.addEventListener('click', () => {

                PrivilegesView.showCategoryPrivileges(category, privilegesCallback);
            });
        }

        descriptionContainer.appendChild(descriptionElement);

        if (Privileges.Category.canEditCategoryTags(category)) {

            let link = EditViews.createEditLink('Edit category tags', 'tag');
            result.appendChild(link);
            link.addEventListener('click', async () => {

                const allTags = await callback.getAllTags();
                TagsView.showSelectTagsDialog(category.tags, allTags,
                    (added: string[], removed: string[]) => {

                        reloadIfOk(callback.editCategoryTags(category.id, added, removed));
                    });
            });
        }

        if (category.tags && category.tags.length) {

            TagRepository.sortByName(category.tags);
            for (let tag of category.tags) {

                result.appendChild(TagsView.createTagElement(tag).toElement());
                result.appendChild(document.createTextNode(' '));
            }
        }

        Views.setupThreadsWithTagsLinks(result);

        return result;
    }

    export function createRootCategoriesDisplay(categories: CategoryRepository.Category[],
                                                callback: ICategoryCallback): HTMLElement {

        let result = document.createElement('div');
        result.appendChild(createCategoriesTable(categories, callback));

        if (Privileges.ForumWide.canAddNewRootCategory()) {

            result.appendChild(createAddNewRootCategoryElement(callback));
        }

        return result;
    }

    export function createCategoryDisplay(category: CategoryRepository.Category,
                                          threadList: HTMLElement,
                                          callback: ICategoryCallback,
                                          privilegesCallback: IPrivilegesCallback): HTMLElement {

        let result = document.createElement('div');
        result.appendChild(createCategoryHeader(category, callback, privilegesCallback));

        let separatorNeeded = false;

        if (category.children && category.children.length) {

            result.appendChild(createCategoriesTable(category.children, callback));
            separatorNeeded = true;
        }

        if (Privileges.Category.canAddNewSubCategory(category)) {

            result.appendChild(createAddNewSubCategoryElement(category.id, callback));
        }

        if (threadList) {

            if (separatorNeeded) {
                let separator = document.createElement('hr');
                result.appendChild(separator);

                separator.classList.add('uk-divider-icon');
            }

            result.appendChild(threadList);
        }

        return result;
    }

    function createAddNewRootCategoryElement(callback: ICategoryCallback): HTMLElement {

        let button = EditViews.createAddNewButton('Add Root Category');

        button.addEventListener('click', () => {

            const name = EditViews.getInput('Enter the new category name');
            if ((null === name) || (name.length < 1)) return;

            reloadIfOk(callback.createRootCategory(name));
        });

        return EditViews.wrapAddElements(button);
    }

    function createAddNewSubCategoryElement(parentId: string, callback: ICategoryCallback): HTMLElement {

        let button = EditViews.createAddNewButton('Add Sub Category');

        button.addEventListener('click', () => {

            const name = EditViews.getInput('Enter the new sub category name');
            if ((null === name) || (name.length < 1)) return;

            reloadIfOk(callback.createSubCategory(parentId, name));
        });

        return EditViews.wrapAddElements(button);
    }

    function setupEditCategoryDisplayCategories(container: HTMLElement, callback: ICategoryCallback): void {

        const eventHandler = (ev: Event) => {

            ev.preventDefault();

            const link = DOMHelpers.getLink(ev);
            const categoryId = link.getAttribute('data-category-id');
            const categoryDisplayOrder = link.getAttribute('data-category-display-order');

            const newValue = parseInt(EditViews.getInput('Edit category display order', categoryDisplayOrder));
            if ((newValue >= 0) && (newValue.toString() != categoryDisplayOrder)) {

                reloadIfOk(callback.editCategoryDisplayOrder(categoryId, newValue));
            }
        };

        const elements = container.getElementsByClassName('editDisplayOrderLink');
        for (let i = 0; i < elements.length; ++i) {

            elements[i].addEventListener('click', (ev) => eventHandler(ev));
        }
    }

    function showSelectCategoryParentDialog(allCategories: CategoryRepository.Category[], currentParentId: string,
                                            onSave: (newParentId: string) => void): void {

        let modal = document.getElementById('select-category-parent-modal');
        Views.showModal(modal);

        let saveButton = modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement;
        let form = modal.getElementsByTagName('form')[0] as HTMLFormElement;

        saveButton = DOMHelpers.removeEventListeners(saveButton);
        saveButton.addEventListener('click', (ev) => {

            ev.preventDefault();

            const selectedRadio = document.querySelector('input[name="categoryParentId"]:checked') as HTMLInputElement;
            if (selectedRadio && selectedRadio.value) {

                onSave(selectedRadio.value);
            }
        });

        form.innerHTML = '';

        let list = document.createElement('ul');
        list.classList.add('uk-list');
        form.appendChild(list);

        function addCategory(category: CategoryRepository.Category, level: number) {

            let row = document.createElement('li');
            list.appendChild(row);
            row.classList.add(`level${level}`);

            let input = document.createElement('input');
            row.appendChild(input);

            input.setAttribute('type', 'radio');
            input.setAttribute('name', 'categoryParentId');
            input.setAttribute('id', 'categoryParentId-' + category.id);
            input.setAttribute('value', category.id);

            if (category.id == currentParentId) {
                input.setAttribute('checked', '');
            }
            input.classList.add('uk-radio');

            let label = document.createElement('label');
            row.appendChild(label);

            label.setAttribute('for', 'categoryParentId-' + category.id);
            label.innerText = category.name;

            for (let child of (category.children || [])) {
                addCategory(child, level + 1);
            }
        }

        let rootCategory = {

            id: CategoryRepository.EmptyCategoryId,
            name: 'Root',
            children: allCategories

        } as CategoryRepository.Category;

        addCategory(rootCategory, 0);
    }
}