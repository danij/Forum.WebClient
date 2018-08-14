import {ThreadRepository} from "../services/threadRepository";
import {Views} from "./common";
import {UsersView} from "./usersView";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {TagsView} from "./tagsView";
import {DOMHelpers} from "../helpers/domHelpers";
import {TagRepository} from "../services/tagRepository";
import {UserRepository} from "../services/userRepository";
import {Pages} from "../pages/common";
import {Privileges} from "../services/privileges";
import {PageActions} from "../pages/action";
import {EditViews} from "./edit";
import {ViewsExtra} from "./extra";
import {ThreadMessagesPage} from "../pages/threadMessagesPage";
import {CategoryRepository} from "../services/categoryRepository";
import {PrivilegesView} from "./privilegesView";

export module ThreadsView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;

    export class ThreadsPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement
    }

    export function createThreadsLink(thread: ThreadRepository.Thread, showAsButton: boolean = false,
                                      addSpace: boolean = false): DOMAppender {

        const href = Pages.getThreadMessagesOfThreadUrlFull(thread);
        const data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;

        const visitedClass = thread.visitedSinceLastChange ? 'already-visited' : '';

        const classes = showAsButton ? 'uk-button uk-button-text ' : '';

        const result = dA(`<a class="${classes}thread-name render-math ${visitedClass}" href="${href}" ${data}>`);
        result.appendString((addSpace ? ' ' : '') + thread.name);

        return result;
    }

    export function createThreadsPageContent(collection: ThreadRepository.ThreadCollection,
                                             info: ThreadPageDisplayInfo,
                                             onPageNumberChange: Views.PageNumberChangeCallback,
                                             getLinkForPage: Views.GetLinkForPageCallback,
                                             tagCallback: PageActions.ITagCallback,
                                             userCallback: PageActions.IUserCallback,
                                             privilegesCallback: PageActions.IPrivilegesCallback) {

        collection = collection || ThreadRepository.defaultThreadCollection();

        const result = new ThreadsPageContent();

        const resultList = cE('div');

        if (info.tag) {

            resultList.appendChild(TagsView.createTagPageHeader(info.tag, tagCallback, privilegesCallback));
        }
        else if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, privilegesCallback));
        }

        resultList.appendChild(result.sortControls = createThreadListSortControls(info));
        resultList.appendChild(
            result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        const tableContainer = cE('div');
        resultList.appendChild(tableContainer);
        tableContainer.classList.add('threads-table');
        tableContainer.appendChild(createThreadsTable(collection.threads));

        resultList.appendChild(
            result.paginationBottom = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        result.list = resultList;
        return result;
    }

    export interface ThreadPageDisplayInfo extends Views.SortInfo {

        tag?: TagRepository.Tag,
        user?: UserRepository.User
    }

    function createThreadListSortControls(info: Views.SortInfo): HTMLElement {

        return DOMHelpers.parseHTML('<div class="threads-list-header">\n' +
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
            '</div>');
    }

    export function createThreadsTable(threads: ThreadRepository.Thread[]): HTMLElement {

        if (threads.length < 1) {

            return DOMHelpers.parseHTML('<span class="uk-text-warning">No threads found</span>');
        }

        const table = dA('<table class="uk-table uk-table-divider uk-table-middle">');

        const tableHeader = '<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Thread</th>\n' +
            '        <th class="uk-text-center thread-created-header uk-table-shrink">Added</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);

        const tbody = dA('<tbody>');
        table.append(tbody);

        for (const thread of threads) {

            if (null == thread) continue;

            const row = dA('<tr>');
            tbody.append(row);
            {
                const nameColumn = dA('<td class="uk-table-expand">');
                row.append(nameColumn);

                if (thread.pinned) {
                    nameColumn.append(dA(`<span class="uk-icon pinned-icon" uk-icon="icon: star; ratio: 1.5" title="Thread is pinned" uk-tooltip>`));
                }

                const threadLink = createThreadsLink(thread, true, true);
                nameColumn.append(threadLink);

                const details = dA('<div class="thread-tags">');
                nameColumn.append(details);

                if (thread.voteScore < 0) {
                    details.appendRaw(`<span class="uk-label score-down">${DisplayHelpers.intToStringLargeMinus(Math.abs(thread.voteScore))}</span>`);
                }
                else if (thread.voteScore == 0) {
                    details.appendRaw(`<span class="uk-label score-neutral">0</span>`);
                }
                else {
                    details.appendRaw(`<span class="uk-label score-up">+ ${DisplayHelpers.intToString(thread.voteScore)}</span>`);
                }
                details.appendRaw(' ');

                for (const tag of thread.tags) {

                    if (null == tag) continue;

                    details.append(TagsView.createTagElement(tag));
                    details.appendRaw(' ');
                }
            }
            {
                const createdColumn = dA('<td class="thread-created uk-text-center uk-table-shrink">');
                row.append(createdColumn);

                createdColumn.append(UsersView.createAuthorSmall(thread.createdBy));

                createdColumn.appendRaw(('<div class="thread-message-time uk-text-meta">\n' +
                    '    <span>{Added}</span>\n' +
                    '</div>')
                    .replace('{Added}', DisplayHelpers.getDateTime(thread.created)));
            }
            {
                const statisticsColumn = ('<td class="thread-statistics uk-table-shrink">\n' +
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
                const latestMessageColumn = dA('<td class="latest-message">');
                row.append(latestMessageColumn);

                const container = dA('<div>');
                latestMessageColumn.append(container);

                const latestMessage = thread.latestMessage;

                if (latestMessage) {

                    container.append(UsersView.createUserLogoSmall(latestMessage.createdBy));

                    const timeFlex = dA('<div class="date-time-flex">');
                    container.append(timeFlex);

                    timeFlex.append(UsersView.createAuthorSmall(latestMessage.createdBy));

                    const recentMessageTime = cE('span');
                    recentMessageTime.classList.add('uk-text-meta');
                    recentMessageTime.innerHTML = DisplayHelpers.getDateTime(latestMessage.created);
                    timeFlex.appendElement(recentMessageTime);

                    const messageContent = latestMessage.content || 'empty';

                    const messageLink = cE('a');
                    messageLink.classList.add('recent-message-link');
                    messageLink.setAttribute('title', messageContent);
                    messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(latestMessage.id));
                    messageLink.setAttribute('data-threadmessageid', latestMessage.id);
                    messageLink.innerText = messageContent;
                    container.appendElement(messageLink);
                }
            }
        }

        const result = table.toElement();

        Views.setupCategoryLinks(result);
        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadsOfUsersLinks(result);
        Views.setupSubscribedThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);

        Views.markElementForAnimatedDisplay(result, '.threads-table tbody');

        return result;
    }

    export function createRecentThreadsView(threads: ThreadRepository.Thread[]): HTMLElement {

        const result = dA('<div>');

        for (let thread of threads) {

            if (null === thread) continue;

            const element = dA('<div class="recent-thread">');
            result.append(element);

            const score = DisplayHelpers.intToString(Math.abs(thread.voteScore));

            if (0 === thread.voteScore) {

                element.appendRaw(`<span class="thread-vote neutral-vote" aria-expanded="false">0</span>`);
            }
            else if (thread.voteScore < 0) {

                element.appendRaw(`<span class="thread-vote down-vote" aria-expanded="false">−${score}</span>`);
            }
            else {
                element.appendRaw(`<span class="thread-vote up-vote" aria-expanded="false">+${score}</span>`);
            }

            const user = dA('<span class="author">');
            element.append(user);

            const userLink = dA(`<a ${UsersView.getThreadsOfUserLinkContent(thread.createdBy)}>`);
            user.append(userLink);
            userLink.appendString(thread.createdBy.name);

            const title = DOMHelpers.escapeStringForAttribute(thread.name);

            const href = Pages.getThreadMessagesOfThreadUrlFull(thread);
            const data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;
            const link = dA(`<a href="${href}" class="recent-thread-link render-math" title="${title}" ${data}>`);
            element.append(link);
            link.appendString(thread.name);
        }

        const resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupSubscribedThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);

        return resultElement;
    }

    export function createThreadPageHeader(thread: ThreadRepository.Thread,
                                           callback: PageActions.IThreadCallback,
                                           privilegesCallback: PageActions.IPrivilegesCallback): HTMLElement {

        const element = cE('div');
        element.classList.add('uk-container', 'uk-container-expand', 'thread-header');

        const card = cE('div');
        element.appendChild(card);
        card.classList.add('uk-card', 'uk-card-body');

        {
            /* append to card:
            <a uk-icon="icon: settings" href="editThreadPrivileges" title="Edit thread access" uk-tooltip
               uk-toggle="target: #privileges-modal"></a>
            */
            const actions = cE('div');
            card.appendChild(actions);
            actions.classList.add('thread-actions');

            const subscribeToThread = cE('button');
            actions.appendChild(subscribeToThread);
            subscribeToThread.classList.add('uk-button', 'uk-button-primary', 'uk-button-small');
            subscribeToThread.innerText = 'Subscribe';

            actions.appendChild(document.createTextNode(' '));

            const unSubscribeFromThread = cE('button');
            actions.appendChild(unSubscribeFromThread);
            unSubscribeFromThread.classList.add('uk-button', 'uk-button-danger', 'uk-button-small');
            unSubscribeFromThread.innerText = 'Unsubscribe';

            actions.appendChild(document.createTextNode(' '));

            DOMHelpers.hide(thread.subscribedToThread ? subscribeToThread : unSubscribeFromThread);

            subscribeToThread.addEventListener('click', async () => {

                if (await callback.subscribeToThread(thread.id)) {

                    DOMHelpers.hide(subscribeToThread);
                    DOMHelpers.unHide(unSubscribeFromThread);
                }
            });
            unSubscribeFromThread.addEventListener('click', async () => {

                if (await callback.unSubscribeFromThread(thread.id)) {

                    DOMHelpers.hide(unSubscribeFromThread);
                    DOMHelpers.unHide(subscribeToThread);
                }
            });

            if (Privileges.Thread.canMergeThreads(thread)) {

                const link = EditViews.createEditLink('Merge threads', 'git-fork', []);
                actions.appendChild(link);
                link.addEventListener('click', async () => {

                    showSelectSingleThreadDialog(callback, async (selected: string) => {

                        if (await callback.mergeThreads(thread.id, selected)) {
                            new ThreadMessagesPage().displayForThread(selected);
                        }
                    });
                });
            }

            if (Privileges.Thread.canViewThreadRequiredPrivileges(thread)
                || Privileges.Thread.canViewThreadAssignedPrivileges(thread)) {

                const link = EditViews.createEditLink('Privileges', 'settings', []);
                actions.appendChild(link);
                link.addEventListener('click', async () => {

                    PrivilegesView.showThreadPrivileges(thread, privilegesCallback);
                });
            }

            if (Privileges.Thread.canDeleteThread(thread)) {

                const deleteLink = EditViews.createDeleteLink('Delete thread', '');
                actions.appendChild(deleteLink);

                deleteLink.addEventListener('click', () => {

                    if (EditViews.confirm(`Are you sure you want to delete the following thread: ${thread.name}?`)) {

                        EditViews.goToHomePageIfOk(callback.deleteThread(thread.id));
                    }
                });
            }
        }
        {
            const title = cE('div');
            card.appendChild(title);
            title.classList.add('uk-align-left', 'thread-title');

            if (Privileges.Thread.canEditThreadPinDisplayOrder(thread)) {
                const link = EditViews.createEditLink('Edit thread display order when pinned', 'star');
                title.appendChild(link);
                link.addEventListener('click', () => {

                    const newValue = parseInt(EditViews.getInput('Edit thread display order when pinned', (thread.pinDisplayOrder || 0).toString()));

                    if ((newValue >= 0) && (newValue != thread.pinDisplayOrder)) {

                        thread.pinDisplayOrder = newValue;
                        callback.editThreadPinDisplayOrder(thread.id, newValue);
                    }
                });
            }

            const threadTitle = cE('span');
            if (Privileges.Thread.canEditThreadName(thread)) {
                const link = EditViews.createEditLink('Edit thread name');
                title.appendChild(link);
                link.addEventListener('click', () => {

                    const name = EditViews.getInput('Edit thread name', thread.name);
                    if (name && name.length && (name != thread.name)) {

                        EditViews.doIfOk(callback.editThreadName(thread.id, name), () => {

                            threadTitle.innerText = thread.name = name;
                            ViewsExtra.refreshMath(threadTitle);
                        });
                    }
                });

            }
            title.appendChild(threadTitle);
            threadTitle.classList.add('uk-logo', 'render-math');

            threadTitle.innerText = thread.name;
            title.appendChild(document.createTextNode(' '));

            const userLink = DOMHelpers.parseHTML(`<a class="author" ${UsersView.getThreadsOfUserLinkContent(thread.createdBy)}></a>`);
            title.appendChild(userLink);
            userLink.innerText = thread.createdBy.name;
        }
        {
            card.appendChild(DOMHelpers.parseHTML('<div class="uk-clearfix"></div>'));
        }
        {
            const details = cE('div');
            card.appendChild(details);
            details.classList.add('thread-details', 'uk-align-left');

            if (Privileges.Thread.canEditThreadTags(thread)) {

                const link = EditViews.createEditLink('Edit thread tags', 'tag');
                details.appendChild(link);
                link.addEventListener('click', async () => {

                    const allTags = await callback.getAllTags();
                    TagsView.showSelectTagsDialog(thread.tags, allTags,
                        (added: string[], removed: string[]) => {

                            EditViews.reloadPageIfOk(callback.editThreadTags(thread.id, added, removed));
                        });
                });
            }

            if (thread.tags && thread.tags.length) {

                TagRepository.sortByName(thread.tags);
                for (let tag of thread.tags) {

                    details.appendChild(TagsView.createTagElement(tag).toElement());
                    details.appendChild(document.createTextNode(' '));
                }
            }

            details.appendChild(DOMHelpers.parseHTML('<span>Displayed under: </span>'));
            if (thread.categories && thread.categories.length) {

                thread.categories.sort(CategoryRepository.compareCategoriesByName);
                for (let category of thread.categories) {

                    const element = DOMHelpers.parseHTML('<a href="' +
                        Pages.getCategoryFullUrl(category) +
                        '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                        DOMHelpers.escapeStringForAttribute(category.name) + '"></a>');
                    details.appendChild(element);
                    element.innerText = category.name;
                    details.appendChild(document.createTextNode(' · '));
                }
            }
            else {

                details.appendChild(DOMHelpers.parseHTML('<span class="uk-text-warning">&lt;none&gt;</span>'));
                details.appendChild(document.createTextNode(' · '));
            }
            details.appendChild(document.createTextNode(`${DisplayHelpers.intToString(thread.visited)} total views · `));

            const subscribedUsersLink = cE('a');
            details.appendChild(subscribedUsersLink);
            subscribedUsersLink.innerText = `${DisplayHelpers.intToString(thread.subscribedUsersCount)} subscribed users`;
            subscribedUsersLink.addEventListener('click', (ev) => {

                ev.preventDefault();
                showSubscribedUsers(thread.id, callback);
            })
        }
        {
            card.appendChild(DOMHelpers.parseHTML('<div class="uk-clearfix"></div>'));
        }

        Views.setupThreadsWithTagsLinks(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupCategoryLinks(element);

        return element;
    }

    export function showSelectSingleThreadDialog(callback: PageActions.IThreadCallback,
                                                 onSave: (selected: string) => void): void {

        const modal = document.getElementById('select-single-thread-modal');
        Views.showModal(modal);

        const saveButton = DOMHelpers.removeEventListeners(
            modal.getElementsByClassName('uk-button-primary')[0] as HTMLElement);
        const searchByNameElement = document.getElementById('searchThreadByName') as HTMLInputElement;
        let selectElement = modal.getElementsByTagName('select')[0] as HTMLSelectElement;
        const selectedIdElement = document.getElementById('selectedThreadId') as HTMLInputElement;

        searchByNameElement.value = '';
        selectElement.innerHTML = '';
        selectedIdElement.value = '';

        saveButton.addEventListener('click', (ev) => {

            ev.preventDefault();

            const selectedId = selectedIdElement.value.trim();
            if (selectedId.length) {

                onSave(selectedId);
            }
        });

        let searchTimeout: number;

        searchByNameElement.addEventListener('keyup', () => {

            if (searchTimeout) {

                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(async () => {

                selectElement.innerHTML = '';
                selectElement = DOMHelpers.removeEventListeners(selectElement);

                const threads = await callback.searchThreadsByInitial(searchByNameElement.value);
                for (const thread of threads) {

                    const option = cE('option');
                    option.setAttribute('value', thread.id);
                    option.innerText = thread.name;
                    option.setAttribute('title', thread.createdBy.name + ' @ ' + DisplayHelpers.getDateTime(thread.created));

                    selectElement.appendChild(option);
                }

                selectElement.addEventListener('change', () => {

                    if (selectElement.selectedOptions && selectElement.selectedOptions.length) {

                        selectedIdElement.value = selectElement.selectedOptions[0].value;
                    }
                });

            }, Views.DisplayConfig.searchThreadWaitMilliseconds);
        });
    }

    async function showSubscribedUsers(threadId: string, callback: PageActions.IThreadCallback) {

        const modal = document.getElementById('subscribed-users-modal');
        const content = modal.getElementsByClassName('subscribed-users-content')[0];

        content.innerHTML = '';

        Views.showModal(modal);

        const users = await callback.getSubscribedUsers(threadId);

        content.appendChild(UsersView.createUserListContent(users));
    }

    export function createAddNewThreadContent(allTags: TagRepository.Tag[],
                                              callback: (name: string, tagIds: string[], message: string) => Promise<string>): HTMLElement {

        const result = cE('div');

        result.appendChild(DOMHelpers.parseHTML('<h2>Add a New Thread</h2>'));

        const form = DOMHelpers.parseHTML('<form class="uk-form-stacked"></form>');
        result.appendChild(form);

        let input: HTMLInputElement;
        let tagsSelect: HTMLSelectElement;
        let editControl: EditViews.EditControl;

        {
            const div = DOMHelpers.parseHTML('<div class="uk-margin"></div>');
            form.appendChild(div);

            div.appendChild(DOMHelpers.parseHTML('<label class="uk-form-label" for="addThreadName">Thread Name</label>'));
            const formControl = DOMHelpers.parseHTML('<div class="uk-form-controls"></div>');
            div.appendChild(formControl);
            input = DOMHelpers.parseHTML('<input class="uk-input" id="addThreadName" />') as HTMLInputElement;
            formControl.appendChild(input);
        }
        {
            const div = DOMHelpers.parseHTML('<div class="uk-margin"></div>');
            form.appendChild(div);

            div.appendChild(DOMHelpers.parseHTML('<label class="uk-form-label">Thread Tags</label>'));
            tagsSelect = DOMHelpers.parseHTML('<select class="uk-select" multiple></select>') as HTMLSelectElement;
            div.appendChild(tagsSelect);

            TagsView.populateTagsInSelect(tagsSelect, allTags);
        }
        {
            const div = DOMHelpers.parseHTML('<div class="uk-margin"></div>');
            form.appendChild(div);

            div.appendChild(DOMHelpers.parseHTML('<label class="uk-form-label">Thread Message</label>'));
            const newMessageContainer = DOMHelpers.parseHTML('<div class="reply-container"></div>');
            div.appendChild(newMessageContainer);

            editControl = new EditViews.EditControl(newMessageContainer);
        }

        const addButton = DOMHelpers.parseHTML('<button class="uk-button uk-button-primary uk-align-center">Add</button>');
        result.appendChild(addButton);

        addButton.addEventListener('click', async (ev) => {

            ev.preventDefault();

            const name = input.value;
            const tagIds: string[] = [];

            const selected = tagsSelect.selectedOptions;
            for (let i = 0; i < selected.length; ++i) {

                tagIds.push(selected[i].getAttribute('value'));
            }

            const message = editControl.getText();

            const newThreadId = await callback(name, tagIds, message);
            if (newThreadId && newThreadId.length) {

                new ThreadMessagesPage().displayForThread(newThreadId);
            }
        });

        return result;
    }
}