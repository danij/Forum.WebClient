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

export module CategoriesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import ICategoryCallback = PageActions.ICategoryCallback;
    import ICategoryPrivileges = Privileges.ICategoryPrivileges;
    import reloadIfOk = EditViews.reloadPageIfOk;
    import doIfOk = EditViews.doIfOk;

    export function createCategoriesTable(categories: CategoryRepository.Category[]): HTMLElement {

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

                nameColumn.append(new DOMAppender('<span class="uk-icon" uk-icon="icon: folder">', '</span>'));

                let nameLink = new DOMAppender('<a class="uk-button uk-button-text" href="' +
                    Pages.getCategoryFullUrl(category) +
                    '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                    DOMHelpers.escapeStringForAttribute(category.name) + '">', '</a>');
                nameColumn.append(nameLink);
                nameLink.appendString(' ' + category.name);
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

                        let element = new DOMAppender('<a href="' +
                            Pages.getCategoryFullUrl(childCategory) +
                            '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(childCategory.id) + '" data-categoryname="' +
                            DOMHelpers.escapeStringForAttribute(childCategory.name) + '">', '</a>');
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

        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);
        Views.setupCategoryLinks(result);

        return result;
    }

    export function createCategoryHeader(category: CategoryRepository.Category,
                                         callback: ICategoryCallback,
                                         privileges: ICategoryPrivileges): HTMLElement {

        let result = document.createElement('div');
        result.classList.add('categories-list-header');

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

        if (privileges.canEditCategoryName(category.id)) {

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
        result.appendChild(descriptionContainer);

        let descriptionElement = document.createElement('span');
        descriptionElement.innerText = category.description || '';
        descriptionElement.classList.add('uk-text-meta');

        if (privileges.canEditCategoryDescription(category.id)) {

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

        descriptionContainer.appendChild(descriptionElement);

        if (category.tags && category.tags.length) {

            for (let tag of category.tags) {

                result.appendChild(TagsView.createTagElement(tag).toElement());
                result.appendChild(document.createTextNode(' '));
            }
        }

        if (privileges.canDeleteCategory(category.id)) {

            let deleteLink = EditViews.createDeleteLink('Delete category');
            result.appendChild(deleteLink);

            deleteLink.addEventListener('click', () => {

                if (EditViews.confirm('Are you sure you want to delete this category?')) {

                    EditViews.goToHomePageIfOk(callback.deleteCategory(category.id));
                }
            });
        }

        return result;
    }

    export function createRootCategoriesDisplay(categories: CategoryRepository.Category[],
                                                callback: ICategoryCallback,
                                                privileges: ICategoryPrivileges): HTMLElement {

        let result = document.createElement('div');
        result.appendChild(createCategoriesTable(categories));

        if (privileges.canAddNewRootCategory()) {

            result.appendChild(createAddNewRootCategoryElement(callback));
        }

        return result;
    }

    export function createCategoryDisplay(category: CategoryRepository.Category,
                                          threadList: HTMLElement,
                                          callback: ICategoryCallback,
                                          privileges: ICategoryPrivileges): HTMLElement {

        let result = document.createElement('div');
        result.appendChild(createCategoryHeader(category, callback, privileges));

        let separatorNeeded = false;

        if (category.children && category.children.length) {

            result.appendChild(createCategoriesTable(category.children));
            separatorNeeded = true;
        }

        if (privileges.canAddNewSubCategory(category.id)) {

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
            if (name.length < 1) return;

            reloadIfOk(callback.createRootCategory(name));
        });

        return EditViews.wrapAddElements(button);
    }

    function createAddNewSubCategoryElement(parentId: string, callback: ICategoryCallback): HTMLElement {

        let button = EditViews.createAddNewButton('Add Sub Category');

        button.addEventListener('click', () => {

            const name = EditViews.getInput('Enter the new sub category name');
            if (name.length < 1) return;

            reloadIfOk(callback.createSubCategory(parentId, name));
        });

        return EditViews.wrapAddElements(button);
    }
}