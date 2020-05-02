import {ThreadRepository} from '../services/threadRepository';
import {Views} from './common';
import {UsersView} from './usersView';
import {DisplayHelpers} from '../helpers/displayHelpers';
import {TagsView} from './tagsView';
import {DOMHelpers} from '../helpers/domHelpers';
import {TagRepository} from '../services/tagRepository';
import {UserRepository} from '../services/userRepository';
import {Pages} from '../pages/common';
import {Privileges} from '../services/privileges';
import {PageActions} from '../pages/action';
import {EditViews} from './edit';
import {ViewsExtra} from './extra';
import {ThreadMessagesPage} from '../pages/threadMessagesPage';
import {CategoryRepository} from '../services/categoryRepository';
import {PrivilegesView} from './privilegesView';
import {AttachmentsView} from "./attachmentsView";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {LanguageService} from "../services/languageService";

export module ThreadsView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import cE = DOMHelpers.cE;
    import L = LanguageService.translate;

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

        let classes = showAsButton ? 'uk-button uk-button-text ' : '';
        if ( ! thread.approved) {

            classes = classes + 'unapproved ';
        }

        const link = dA(`<a class="${classes}thread-name render-math ${visitedClass}" href="${href}" ${data}>`);
        link.appendString((addSpace ? ' ' : '') + thread.name);

        let result: DOMAppender;

        if (thread.latestVisitedPage > 0) {

            result = dA('span');
            result.append(link);

            const pageHref = Pages.getThreadMessagesOfThreadUrlFull(thread, thread.latestVisitedPage + 1);
            const data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}" 
                          data-threadmessagethreadpage="${parseInt(thread.latestVisitedPage.toString())}"`;

            const goToPage = dA(`<a href="${pageHref}" ${data} class="uk-icon-link thread-latest-visited-page-link" uk-icon="icon: chevron-right; ratio: 1.25" title="${L('Go to latest visited page')}" uk-title>`);
            result.append(goToPage);
        }
        else {

            result = link;
        }

        return result;
    }

    export async function createThreadsPageContent(collection: ThreadRepository.ThreadCollection,
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
            result.paginationTop = Views.createPaginationControl(collection, L('threads'),
                onPageNumberChange, getLinkForPage));

        const tableContainer = cE('div');
        resultList.appendChild(tableContainer);
        DOMHelpers.addClasses(tableContainer, 'threads-table');
        tableContainer.appendChild(await createThreadsTable(collection.threads));

        resultList.appendChild(
            result.paginationBottom = Views.createPaginationControl(collection, L('threads'),
                onPageNumberChange, getLinkForPage));

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
            `                ${L('Sort by:')}\n` +
            Views.createOrderByLabel('name', L('Name'), info) +
            Views.createOrderByLabel('created', L('Created'), info) +
            Views.createOrderByLabel('latestmessagecreated', L('Latest Message Added'), info) +
            Views.createOrderByLabel('messagecount', L('Message Count'), info) +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            Views.createSortOrderOption('ascending', L('Ascending'), info) +
            Views.createSortOrderOption('descending', L('Descending'), info) +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>');
    }

    export async function createThreadsTable(threads: ThreadRepository.Thread[]): Promise<HTMLElement> {

        if (threads.length < 1) {

            return DOMHelpers.parseHTML(`<span class="uk-text-warning">${L('No threads found')}</span>`);
        }

        const allMessages = threads
            .filter(t => t && t.latestMessage)
            .map(t => t.latestMessage.content);
        await ViewsExtra.searchUsersById(allMessages);

        const table = dA('<table class="uk-table uk-table-divider uk-table-middle">');

        const tableHeader = '<thead>\n' +
            '    <tr>\n' +
            `        <th class="uk-table-expand">${L('Thread')}</th>\n` +
            `        <th class="uk-text-center thread-created-header uk-table-shrink hide-compact">${L('Added')}</th>\n` +
            `        <th class="uk-text-center uk-table-shrink hide-compact">${L('Statistics')}</th>\n` +
            `        <th class="uk-text-right latest-message-header">${L('Latest Message')}</th>\n` +
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
                    nameColumn.append(dA(`<span class="uk-icon pinned-icon" uk-icon="icon: star; ratio: 1.5" title="${L('Thread is pinned')}">`));
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
                {
                    const createdRow = dA('<span class="vertical-middle show-compact-inline">');
                    details.append(createdRow);

                    createdRow.append(UsersView.createAuthorSmall(thread.createdBy));
                    createdRow.appendRaw(
                        ` @ <span class="thread-message-time uk-text-meta">${DisplayHelpers.getDateTime(thread.created)}</span>`);
                }
                for (const tag of thread.tags) {

                    if (null == tag) continue;

                    details.append(TagsView.createTagElement(tag));
                    details.appendRaw(' ');
                }
                details.appendRaw(('<div class="uk-text-meta show-compact">\n' +
                    `{nrOfMessages} ${L('messages')} · ` +
                    `{nrOfViews} ${L('views')} · ` +
                    `{nrOfSubscribed} ${L('subscribed')}` +
                    '</div>')
                    .replace('{nrOfMessages}', DisplayHelpers.intToString(thread.messageCount))
                    .replace('{nrOfViews}', DisplayHelpers.intToString(thread.visited))
                    .replace('{nrOfSubscribed}', DisplayHelpers.intToString(thread.subscribedUsersCount)));
            }
            {
                const createdColumn = dA('<td class="thread-created uk-text-center uk-table-shrink hide-compact">');
                row.append(createdColumn);

                createdColumn.append(UsersView.createAuthorSmall(thread.createdBy));

                createdColumn.appendRaw(('<div class="thread-message-time uk-text-meta">\n' +
                    '    <span>{Added}</span>\n' +
                    '</div>')
                    .replace('{Added}', DisplayHelpers.getDateTime(thread.created)));
            }
            {
                const statisticsColumn = ('<td class="thread-statistics uk-table-shrink hide-compact">\n' +
                    '    <table>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfMessages}</td>\n' +
                    `            <td class="spaced-number uk-text-left uk-text-meta">${L('messages')}</td>\n` +
                    '        </tr>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfViews}</td>\n' +
                    `            <td class="spaced-number uk-text-left uk-text-meta">${L('views')}</td>\n` +
                    '        </tr>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfSubscribed}</td>\n' +
                    `            <td class="spaced-number uk-text-left uk-text-meta">${L('subscribed')}</td>\n` +
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
                    DOMHelpers.addClasses(recentMessageTime, 'uk-text-meta');
                    recentMessageTime.innerHTML = DisplayHelpers.getDateTime(latestMessage.created);
                    timeFlex.appendElement(recentMessageTime);

                    const messageContent = latestMessage.content || 'empty';

                    const messageLink = cE('a');
                    DOMHelpers.addClasses(messageLink, 'recent-message-link');
                    if ( ! latestMessage.approved) {

                        DOMHelpers.addClasses(messageLink, 'unapproved');
                    }
                    messageLink.setAttribute('title', messageContent);
                    messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(latestMessage.id));
                    messageLink.setAttribute('data-threadmessageid', latestMessage.id);
                    messageLink.innerText = ViewsExtra.replaceUserIdReferencesWithName(messageContent);
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
        Views.setupAttachmentsAddedByUserLinks(result);

        return result;
    }

    export function createRecentThreadsView(threads: ThreadRepository.Thread[]): HTMLElement {

        const result = dA('<div>');

        let atLeastOneThread = false;

        for (let thread of threads) {

            if (null === thread) continue;

            atLeastOneThread = true;

            const element = dA('<div class="recent-thread">');
            result.append(element);

            const time = dA('<span class="time-ago">');
            element.append(time);
            time.appendString(DisplayHelpers.getAgoTimeShort(thread.created));

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

            const userLink = UsersView.createAuthorSmall(thread.createdBy);
            user.append(userLink);

            const title = DOMHelpers.escapeStringForAttribute(thread.name);

            const href = Pages.getThreadMessagesOfThreadUrlFull(thread);
            const data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;

            let classes = 'recent-thread-link render-math';
            if ( ! thread.approved) {

                classes = classes + ' unapproved';
            }

            const link = dA(`<a href="${href}" class="${classes}" title="${title}" ${data}>`);
            element.append(link);
            link.appendString(thread.name);
        }

        if ( ! atLeastOneThread) {

            result.appendRaw(`<span class="uk-text-warning">${L('No more threads found')}</span>`);
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
                                           tagCallback: PageActions.ITagCallback,
                                           privilegesCallback: PageActions.IPrivilegesCallback): HTMLElement {

        const element = cE('div');
        DOMHelpers.addClasses(element, 'uk-container', 'uk-container-expand', 'thread-header');

        const card = cE('div');
        element.appendChild(card);
        DOMHelpers.addClasses(card, 'uk-card', 'uk-card-body');

        const threadTitle = cE('span');
        const approvalNotification = cE('span');
        {
            const actions = cE('div');
            card.appendChild(actions);
            DOMHelpers.addClasses(actions, 'thread-actions');

            let subscribeToThread, unSubscribeFromThread: HTMLElement;

            if (Privileges.Thread.canSubscribeToThread(thread)) {

                subscribeToThread = cE('button');
                actions.appendChild(subscribeToThread);
                DOMHelpers.addClasses(subscribeToThread, 'uk-button', 'uk-button-primary', 'uk-button-small');
                subscribeToThread.innerText = L('Subscribe');

                actions.appendChild(document.createTextNode(' '));

                Views.onClick(subscribeToThread, async () => {

                    if (await callback.subscribeToThread(thread.id)) {

                        if (subscribeToThread) DOMHelpers.hide(subscribeToThread);
                        if (unSubscribeFromThread) DOMHelpers.unHide(unSubscribeFromThread);
                    }
                });

                if (thread.subscribedToThread) DOMHelpers.hide(subscribeToThread);
            }
            if (Privileges.Thread.canUnsubscribeToThread(thread)) {

                unSubscribeFromThread = cE('button');
                actions.appendChild(unSubscribeFromThread);
                DOMHelpers.addClasses(unSubscribeFromThread, 'uk-button', 'uk-button-danger', 'uk-button-small');
                unSubscribeFromThread.innerText = L('Unsubscribe');

                actions.appendChild(document.createTextNode(' '));

                Views.onClick(unSubscribeFromThread, async () => {

                    if (await callback.unSubscribeFromThread(thread.id)) {

                        if (unSubscribeFromThread) DOMHelpers.hide(unSubscribeFromThread);
                        if (subscribeToThread) DOMHelpers.unHide(subscribeToThread);
                    }
                });

                if ( ! thread.subscribedToThread) DOMHelpers.hide(unSubscribeFromThread);
            }

            if (Privileges.Thread.canEditThreadApproval(thread)) {

                const approveThreadLink = EditViews.createEditLink(L('Approve Thread'), 'check');
                actions.appendChild(approveThreadLink);

                const unApproveThreadLink = EditViews.createEditLink(L('Unapprove Thread'), 'ban');
                actions.appendChild(unApproveThreadLink);

                Views.onClick(approveThreadLink, async () => {

                    if (thread.approved) return;

                    if (await callback.approve(thread.id)) {

                        thread.approved = true;

                        DOMHelpers.hide(approvalNotification);
                    }
                });

                Views.onClick(unApproveThreadLink, async () => {

                    if ( ! thread.approved) return;

                    if (await callback.unapprove(thread.id)) {

                        thread.approved = false;

                        DOMHelpers.unHide(approvalNotification);
                    }
                });
            }

            if (Privileges.Thread.canEditThreadPinDisplayOrder(thread)) {

                const link = EditViews.createEditLink(L('Edit thread display order when pinned'), 'star');
                actions.appendChild(link);
                Views.onClick(link, () => {

                    const newValue = parseInt(EditViews.getInput(L('Edit thread display order when pinned'), (thread.pinDisplayOrder || 0).toString()));

                    if ((newValue >= 0) && (newValue != thread.pinDisplayOrder)) {

                        thread.pinDisplayOrder = newValue;
                        callback.editThreadPinDisplayOrder(thread.id, newValue);
                    }
                });
            }

            if (Privileges.Thread.canEditThreadName(thread)) {

                const link = EditViews.createEditLink(L('Edit thread name'));
                actions.appendChild(link);
                Views.onClick(link, () => {

                    const name = EditViews.getInput(L('Edit thread name'), thread.name);
                    if (name && name.length && (name != thread.name)) {

                        const min = Views.DisplayConfig.threadNameLengths.min;
                        const max = Views.DisplayConfig.threadNameLengths.max;

                        if (name.length < min) {

                            Views.showWarningNotification(L('THREAD_MIN_LENGTH', min));
                            return;
                        }
                        if (name.length > max) {

                            Views.showWarningNotification(L('THREAD_MAX_LENGTH', max));
                            return;
                        }

                        EditViews.doIfOk(callback.editThreadName(thread.id, name), () => {

                            threadTitle.innerText = thread.name = name;
                            ViewsExtra.refreshMath(threadTitle);
                        });
                    }
                });
            }

            if (Privileges.Thread.canMergeThreads(thread)) {

                const link = EditViews.createEditLink(L('Merge threads'), 'git-fork', []);
                actions.appendChild(link);
                Views.onClick(link, async () => {

                    showSelectSingleThreadDialog(callback, async (selected: string) => {

                        if (await callback.mergeThreads(thread.id, selected)) {
                            new ThreadMessagesPage().displayForThread(selected);
                        }
                    });
                });
            }

            if (Privileges.Thread.canViewThreadRequiredPrivileges(thread)
                || Privileges.Thread.canViewThreadAssignedPrivileges(thread)) {

                const link = EditViews.createEditLink(L('Privileges'), 'settings', []);
                actions.appendChild(link);
                Views.onClick(link, async () => {

                    PrivilegesView.showThreadPrivileges(thread, privilegesCallback);
                });
            }

            if (Privileges.Thread.canDeleteThread(thread)) {

                const deleteLink = EditViews.createDeleteLink(L('Delete thread'), '');
                actions.appendChild(deleteLink);

                Views.onClick(deleteLink, () => {

                    if (EditViews.confirm(L('CONFIRM_THREAD_DELETION', thread.name))) {

                        EditViews.goToHomePageIfOk(callback.deleteThread(thread.id));
                    }
                });
            }
        }
        {
            const title = cE('div');
            card.appendChild(title);

            DOMHelpers.addClasses(title, 'uk-align-left', 'thread-title');

            title.appendChild(approvalNotification);
            DOMHelpers.addClasses(approvalNotification, 'uk-text-danger');
            approvalNotification.innerText = `(${L('Not yet approved')}) `;

            title.appendChild(threadTitle);
            DOMHelpers.addClasses(threadTitle, 'uk-logo', 'render-math');
            if (thread.approved) {

                DOMHelpers.addClasses(approvalNotification, 'uk-hidden');
            }

            threadTitle.innerText = thread.name;
            title.appendChild(document.createTextNode(' '));
        }
        {
            card.appendChild(DOMHelpers.parseHTML('<div class="uk-clearfix"></div>'));
        }
        {
            const details = cE('div');
            card.appendChild(details);
            DOMHelpers.addClasses(details, 'thread-details', 'uk-align-left');

            if (Privileges.Thread.canEditThreadTags(thread)) {

                const link = EditViews.createEditLink(L('Edit thread tags'), 'tag');
                details.appendChild(link);
                Views.onClick(link, async () => {

                    const allTags = await callback.getAllTags();
                    TagsView.showSelectTagsDialog(tagCallback, thread.tags, allTags,
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

            details.appendChild(DOMHelpers.parseHTML(`<span>${L('Displayed under:')} </span>`));
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
            details.appendChild(document.createTextNode(`${L('THREAD_TOTAL_VIEWS', DisplayHelpers.intToString(thread.visited))} · `));

            let subscribedUsersLink;
            if (Privileges.Thread.canViewThreadSubscribedUsers(thread)) {

                subscribedUsersLink = cE('a');
                Views.onClick(subscribedUsersLink, () => { showSubscribedUsers(thread.id, callback); });
            }
            else {

                subscribedUsersLink = cE('span');
            }
            details.appendChild(subscribedUsersLink);
            subscribedUsersLink.innerText = L('THREAD_SUBSCRIBED_USERS', DisplayHelpers.intToString(thread.subscribedUsersCount));
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
        const searchByNameElement = document.getElementById('search-thread-by-name') as HTMLInputElement;
        let selectElement = modal.getElementsByTagName('select')[0] as HTMLSelectElement;
        const selectedIdElement = document.getElementById('selected-thread-id') as HTMLInputElement;

        searchByNameElement.value = '';
        selectElement.innerHTML = '';
        selectedIdElement.value = '';

        Views.onClick(saveButton, () => {

            const selectedId = selectedIdElement.value.trim();
            if (selectedId.length) {

                onSave(selectedId);
            }
        });

        let searchTimeout: any;

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

    export function createAddNewThreadContent(allTags: TagRepository.Tag[], tagCallback: PageActions.ITagCallback,
                                              attachmentsCallback: PageActions.IAttachmentCallback,
                                              callback: (name: string, tagIds: string[], message: string) => Promise<[string, string]>): HTMLElement {

        const result = cE('div');

        result.appendChild(DOMHelpers.parseHTML(`<h2>${L('Add a New Thread')}</h2>`));

        const form = DOMHelpers.parseHTML('<form class="uk-form-stacked"></form>');
        result.appendChild(form);

        let input: HTMLInputElement;
        let tagsContainer: HTMLDivElement;
        let editControl: EditViews.EditControl;

        {
            const div = DOMHelpers.parseHTML('<div class="uk-margin"></div>');
            form.appendChild(div);

            div.appendChild(DOMHelpers.parseHTML(`<label class="uk-form-label" for="addThreadName">${L('Thread Name')}</label>`));
            const formControl = DOMHelpers.parseHTML('<div class="uk-form-controls"></div>');
            div.appendChild(formControl);
            input = DOMHelpers.parseHTML('<input class="uk-input" id="addThreadName" />') as HTMLInputElement;
            formControl.appendChild(input);
        }
        {
            const div = DOMHelpers.parseHTML('<div class="uk-margin"></div>');
            form.appendChild(div);

            div.appendChild(DOMHelpers.parseHTML(`<label class="uk-form-label">${L('Thread Tags')}</label>`));
            tagsContainer = TagsView.createTagSelectionView(tagCallback, allTags);
            div.appendChild(tagsContainer);
        }

        const futureMessageCallback = new PageActions.AttachmentCallbackForFutureMessage(attachmentsCallback);
        {
            const div = DOMHelpers.parseHTML('<div class="uk-margin"></div>');
            form.appendChild(div);

            div.appendChild(DOMHelpers.parseHTML(`<label class="uk-form-label">${L('Thread Message')}</label>`));
            const newMessageContainer = DOMHelpers.parseHTML('<div class="reply-container"></div>');
            div.appendChild(newMessageContainer);

            editControl = new EditViews.EditControl(newMessageContainer);

            newMessageContainer.appendChild(AttachmentsView.createAttachmentsOfMessageList([],
                ThreadMessageRepository.emptyMessage()).toElement());

            const link = DOMHelpers.parseHTML(`<a class="add-attachment-to-message-link">${L('Add attachment')}</a>`);
            newMessageContainer.appendChild(link);

            AttachmentsView.setupAttachmentActionEvents(link, {}, futureMessageCallback);
        }

        const addButton = DOMHelpers.parseHTML(`<button class="uk-button uk-button-primary uk-align-center">${L('Add')}</button>`);
        result.appendChild(addButton);

        Views.onClick(addButton, async () => {

            const name = input.value;
            const tagIds: string[] = TagsView.getSelectedTagIds(tagsContainer);

            const message = (await editControl.getTextInternal()).trim();

            const [newThreadId, newMessageId] = await callback(name, tagIds, message);
            if (newThreadId && newThreadId.length) {

                if (newMessageId) {

                    for (let attachmentId of futureMessageCallback.getAddedAttachmentIds()) {

                        try{
                            await attachmentsCallback.addAttachmentToMessage(attachmentId, newMessageId);
                        }
                        catch {}
                    }
                }
                new ThreadMessagesPage().displayForThread(newThreadId);
            }
        });

        return result;
    }
}