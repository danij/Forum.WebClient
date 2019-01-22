import {CategoryRepository} from '../services/categoryRepository';
import {TagsView} from './tagsView';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {DOMHelpers} from '../helpers/domHelpers';
import {Views} from './common';
import {Pages} from '../pages/common';
import {PageActions} from '../pages/action';
import {Privileges} from '../services/privileges';
import {EditViews} from './edit';
import {TagRepository} from '../services/tagRepository';
import {PrivilegesView} from './privilegesView';
import {ThreadMessagesView} from './threadMessagesView';

export module CategoriesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;

    export function createCategoryLink(category: CategoryRepository.Category,
                                       addSpace: boolean = false,
                                       classes: string = 'uk-button uk-button-text category-link'): DOMAppender {

        const result = dA(`<a class="${classes}" href="` + Pages.getCategoryFullUrl(category) +
            '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
            DOMHelpers.escapeStringForAttribute(category.name) + '">');

        result.appendString((addSpace ? ' ' : '') + category.name);

        return result;
    }

    export function createCategoriesTable(categories: CategoryRepository.Category[], showingRootCategories: boolean,
                                          callback: PageActions.ICategoryCallback): HTMLElement {

        const tableContainer = dA('<div class="categories-table">');
        const table = dA('<table class="uk-table uk-table-divider uk-table-middle">');
        tableContainer.append(table);

        if (categories.length < 1) {

            table.appendRaw('<span class="uk-text-warning">No categories found</span>');
            return tableContainer.toElement();
        }

        const tableHeader = '<thead uk-no-boot>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Category</th>\n' +
            '        <th class="uk-text-center category-tags-header uk-table-shrink">Tags</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);
        const tbody = dA('<tbody>');
        table.append(tbody);

        for (const category of categories) {

            if (null == category) continue;

            createCategoryTableRow(tbody, category, showingRootCategories);
        }

        const result = tableContainer.toElement();

        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadsOfUsersLinks(result);
        Views.setupSubscribedThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);
        Views.setupCategoryLinks(result);
        Views.setupAttachmentsAddedByUserLinks(result);

        setupEditCategoryDisplayCategories(result, callback);

        return result;
    }

    function createCategoryTableRow(container: DOMAppender, category: CategoryRepository.Category,
                                    showingRootCategories: boolean, level: number = 0) {

        const justName = showingRootCategories && (( ! category.tags) || (0 == category.tags.length));

        const row = dA('tr');
        container.append(row);

        {
            const levelClass = level > 0 ? `category-level-${level}` : '';
            const nameColumn = justName
                ? dA('<td class="uk-table-expand category-just-name" colspan="4">')
                : dA(`<td class="uk-table-expand ${levelClass}">`);
            row.append(nameColumn);

            if (Privileges.Category.canEditCategoryDisplayOrder(category)) {

                const attributes = {
                    'data-category-id': category.id,
                    'data-category-display-order': category.displayOrder.toString()
                };
                const dataAttribute = DOMHelpers.concatAttributes(attributes);
                const link = dA(`<a class="edit-display-order-link" ${dataAttribute}>`);
                nameColumn.append(link);
                link.append(dA('<span class="uk-icon" uk-icon="icon: move" title="Edit category display order">'))
            }
            else {

                nameColumn.append(dA('<span class="uk-icon" uk-icon="icon: folder">'));
            }

            const nameLink = createCategoryLink(category, true);
            nameColumn.append(nameLink);
            nameColumn.appendRaw('<br/>');

            const description = dA('<span class="category-description" uk-no-boot>');
            nameColumn.append(description);
            description.appendString(category.description);

            if (( ! showingRootCategories) && category.children && category.children.length) {

                const container = dA('<div uk-no-boot>');
                nameColumn.append(container);

                const childCategoryElement = dA('<span class="category-children uk-text-small">');
                container.appendRaw('<span class="uk-text-meta">Subcategories:</span> ');
                container.append(childCategoryElement);

                for (let i = 0; i < category.children.length; ++i) {

                    const childCategory = category.children[i];

                    const element = createCategoryLink(childCategory, false, '');
                    childCategoryElement.append(element);

                    if (i < (category.children.length - 1)) {
                        childCategoryElement.appendRaw(' · ');
                    }
                }
            }
        }
        if ( ! justName) {
            const tagColumn = dA('<td class="uk-text-center uk-table-shrink">');
            row.append(tagColumn);

            for (const tag of category.tags) {

                if (null == tag) continue;

                tagColumn.append(TagsView.createTagElement(tag));
                tagColumn.appendRaw('\n');
            }
        }
        if ( ! justName) {

            const statisticsColumn = ('<td class="category-statistics uk-table-shrink" uk-no-boot>\n' +
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
        if ( ! justName) {

            row.append(ThreadMessagesView.createLatestMessageColumnView(category.latestMessage));
        }

        if (showingRootCategories && category.children && category.children.length) {

            for (let childCategory of category.children) {

                createCategoryTableRow(container, childCategory, false, level + 1);
            }
        }
    }

    export function createCategoryHeader(category: CategoryRepository.Category,
                                         callback: PageActions.ICategoryCallback,
                                         tagCallback: PageActions.ITagCallback,
                                         privilegesCallback: PageActions.IPrivilegesCallback): HTMLElement {

        const result = cE('div');
        DOMHelpers.addClasses(result, 'categories-list-header');

        if (Privileges.Category.canDeleteCategory(category)) {

            const deleteLink = EditViews.createDeleteLink('Delete category');
            result.appendChild(deleteLink);

            Views.onClick(deleteLink, () => {

                if (EditViews.confirm(`Are you sure you want to delete the following category: ${category.name}?`)) {

                    EditViews.goToHomePageIfOk(callback.deleteCategory(category.id));
                }
            });
        }

        const breadcrumbsList = cE('ul');
        result.appendChild(breadcrumbsList);
        DOMHelpers.addClasses(breadcrumbsList, 'uk-breadcrumb');

        function addToBreadCrumbs(value: CategoryRepository.Category): void {

            if (value.parent) addToBreadCrumbs(value.parent);

            const element = cE('li');
            breadcrumbsList.appendChild(element);

            const link = cE('a') as HTMLAnchorElement;
            element.appendChild(link);

            link.href = Pages.getCategoryFullUrl(value);

            link.appendChild(document.createTextNode(value.name));
            if (value.description && value.description.length) {

                link.setAttribute('title', value.description);
            }

            link.setAttribute('data-categoryid', value.id);
            link.setAttribute('data-categoryname', value.name);

            Views.setupCategoryLink(link);
        }

        if (category.parent) {
            addToBreadCrumbs(category.parent);
        }

        //add the current element also
        const element = cE('li');
        breadcrumbsList.appendChild(element);

        const nameElement = cE('span');
        nameElement.innerText = category.name;

        if (Privileges.Category.canEditCategoryParent(category)) {

            const link = EditViews.createEditLink('Edit category parent', 'git-branch');
            element.appendChild(link);
            Views.onClick(link, async () => {

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

                    EditViews.reloadPageIfOk(callback.editCategoryParent(category.id, newParentId));
                });
            });
        }

        if (Privileges.Category.canEditCategoryName(category)) {

            const link = EditViews.createEditLink('Edit category name');
            element.appendChild(link);
            Views.onClick(link, () => {

                const name = EditViews.getInput('Edit category name', category.name);
                if (name && name.length && (name != category.name)) {

                    EditViews.doIfOk(callback.editCategoryName(category.id, name), () => {

                        nameElement.innerText = category.name = name;
                    });
                }
            });
        }

        element.appendChild(nameElement);

        const descriptionContainer = cE('span');
        element.appendChild(descriptionContainer);
        DOMHelpers.addClasses(descriptionContainer, 'category-description');

        const descriptionElement = cE('span');
        descriptionElement.innerText = category.description || '';
        DOMHelpers.addClasses(descriptionElement, 'uk-text-meta');

        const threadCount = cE('span');
        element.appendChild(threadCount);
        DOMHelpers.addClasses(threadCount, 'uk-margin-left');
        threadCount.innerText = `${DisplayHelpers.intToString(category.threadTotalCount)} threads`;

        const messageCount = cE('span');
        element.appendChild(messageCount);
        DOMHelpers.addClasses(messageCount, 'uk-margin-left');
        messageCount.innerText = `${DisplayHelpers.intToString(category.messageTotalCount)} messages`;

        if (Privileges.Category.canEditCategoryDescription(category)) {

            const link = EditViews.createEditLink('Edit category description');
            descriptionContainer.appendChild(link);
            Views.onClick(link, () => {

                const description = EditViews.getInput('Edit category description', category.description);
                if (description && description.length && (description != category.description)) {

                    EditViews.doIfOk(callback.editCategoryDescription(category.id, description), () => {

                        descriptionElement.innerText = category.description = description;
                    });
                }
            });
        }
        if (Privileges.Category.canViewCategoryRequiredPrivileges(category)
            || Privileges.Category.canViewCategoryAssignedPrivileges(category)) {

            const link = EditViews.createEditLink('Privileges', 'settings');
            result.appendChild(link);

            Views.onClick(link, () => {

                PrivilegesView.showCategoryPrivileges(category, privilegesCallback);
            });
        }

        descriptionContainer.appendChild(descriptionElement);

        if (Privileges.Category.canEditCategoryTags(category)) {

            const link = EditViews.createEditLink('Edit category tags', 'tag');
            result.appendChild(link);
            Views.onClick(link, async () => {

                const allTags = await callback.getAllTags();
                TagsView.showSelectTagsDialog(tagCallback, category.tags, allTags,
                    (added: string[], removed: string[]) => {

                        EditViews.reloadPageIfOk(callback.editCategoryTags(category.id, added, removed));
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
                                                callback: PageActions.ICategoryCallback): HTMLElement {

        const result = cE('div');
        result.appendChild(createCategoriesTable(categories, true, callback));

        if (Privileges.ForumWide.canAddNewRootCategory()) {

            result.appendChild(createAddNewRootCategoryElement(callback));
        }

        return result;
    }

    export function createCategoryDisplay(category: CategoryRepository.Category,
                                          threadList: HTMLElement,
                                          callback: PageActions.ICategoryCallback,
                                          tagCallback: PageActions.ITagCallback,
                                          privilegesCallback: PageActions.IPrivilegesCallback): HTMLElement {

        const result = cE('div');
        result.appendChild(createCategoryHeader(category, callback, tagCallback, privilegesCallback));

        let separatorNeeded = false;

        if (category.children && category.children.length) {

            result.appendChild(createCategoriesTable(category.children, false, callback));
            separatorNeeded = true;
        }

        if (Privileges.Category.canAddNewSubCategory(category)) {

            result.appendChild(createAddNewSubCategoryElement(category.id, callback));
        }

        if (threadList) {

            if (separatorNeeded) {
                const separator = cE('hr');
                result.appendChild(separator);

                DOMHelpers.addClasses(separator, 'uk-divider-icon');
            }

            result.appendChild(threadList);
        }

        return result;
    }

    function createAddNewRootCategoryElement(callback: PageActions.ICategoryCallback): HTMLElement {

        const button = EditViews.createAddNewButton('Add Root Category');

        Views.onClick(button, () => {

            const name = EditViews.getInput('Enter the new category name');
            if ((null === name) || (name.length < 1)) return;

            EditViews.reloadPageIfOk(callback.createRootCategory(name));
        });

        return EditViews.wrapAddElements(button);
    }

    function createAddNewSubCategoryElement(parentId: string, callback: PageActions.ICategoryCallback): HTMLElement {

        const button = EditViews.createAddNewButton('Add Sub Category');

        Views.onClick(button, () => {

            const name = EditViews.getInput('Enter the new sub category name');
            if ((null === name) || (name.length < 1)) return;

            EditViews.reloadPageIfOk(callback.createSubCategory(parentId, name));
        });

        return EditViews.wrapAddElements(button);
    }

    function setupEditCategoryDisplayCategories(container: HTMLElement, callback: PageActions.ICategoryCallback): void {

        const eventHandler = (ev: Event) => {

            ev.preventDefault();

            const link = DOMHelpers.getLink(ev);
            const categoryId = link.getAttribute('data-category-id');
            const categoryDisplayOrder = link.getAttribute('data-category-display-order');

            const newValue = parseInt(EditViews.getInput('Edit category display order', categoryDisplayOrder));
            if ((newValue >= 0) && (newValue.toString() != categoryDisplayOrder)) {

                EditViews.reloadPageIfOk(callback.editCategoryDisplayOrder(categoryId, newValue));
            }
        };

        const elements = container.getElementsByClassName('edit-display-order-link');
        DOMHelpers.forEach(elements, element => {

            Views.onClick(element, (ev) => eventHandler(ev));
        });
    }

    function showSelectCategoryParentDialog(allCategories: CategoryRepository.Category[], currentParentId: string,
                                            onSave: (newParentId: string) => void): void {

        const modal = document.getElementById('select-category-parent-modal');
        Views.showModal(modal);

        const saveButton = DOMHelpers.removeEventListeners(
            modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement);
        const form = modal.getElementsByTagName('form')[0] as HTMLFormElement;

        Views.onClick(saveButton, () => {

            const selectedRadio = document.querySelector('input[name="categoryParentId"]:checked') as HTMLInputElement;
            if (selectedRadio && selectedRadio.value) {

                onSave(selectedRadio.value);
            }
        });

        form.innerHTML = '';

        const list = cE('ul');
        DOMHelpers.addClasses(list, 'uk-list');
        form.appendChild(list);

        function addCategory(category: CategoryRepository.Category, level: number) {

            const row = cE('li');
            list.appendChild(row);
            DOMHelpers.addClasses(row, `level${level}`);

            const input = cE('input');
            row.appendChild(input);

            input.setAttribute('type', 'radio');
            input.setAttribute('name', 'categoryParentId');
            input.setAttribute('id', 'categoryParentId-' + category.id);
            input.setAttribute('value', category.id);

            if (category.id == currentParentId) {
                input.setAttribute('checked', '');
            }
            DOMHelpers.addClasses(input, 'uk-radio');

            const label = cE('label');
            row.appendChild(label);

            label.setAttribute('for', 'categoryParentId-' + category.id);
            label.innerText = category.name;

            for (const child of (category.children || [])) {
                addCategory(child, level + 1);
            }
        }

        const rootCategory = {

            id: CategoryRepository.EmptyCategoryId,
            name: 'Root',
            children: allCategories

        } as CategoryRepository.Category;

        addCategory(rootCategory, 0);
    }
}