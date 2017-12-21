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

export module ThreadsView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import ITagPrivileges = Privileges.ITagPrivileges;
    import ITagCallback = PageActions.ITagCallback;
    import IThreadPrivileges = Privileges.IThreadPrivileges;
    import IThreadCallback = PageActions.IThreadCallback;
    import refreshMath = ViewsExtra.refreshMath;
    import reloadPageIfOk = EditViews.reloadPageIfOk;

    export class ThreadsPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement
    }

    export interface ThreadPageDisplayInfo extends Views.SortInfo {

        tag?: TagRepository.Tag,
        user?: UserRepository.User
    }

    export function createThreadsPageContent(collection: ThreadRepository.ThreadCollection,
                                             info: ThreadPageDisplayInfo,
                                             onPageNumberChange: Views.PageNumberChangeCallback,
                                             getLinkForPage: Views.GetLinkForPageCallback,
                                             tagCallback: ITagCallback,
                                             tagPrivileges: ITagPrivileges) {

        collection = collection || ThreadRepository.defaultThreadCollection();

        let result = new ThreadsPageContent();

        let resultList = document.createElement('div');

        if (info.tag) {

            resultList.appendChild(TagsView.createTagPageHeader(info.tag, tagCallback, tagPrivileges));
        }
        else if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user));
        }

        resultList.appendChild(result.sortControls = createThreadListSortControls(info));
        resultList.appendChild(
            result.paginationTop = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        let tableContainer = document.createElement('div');
        resultList.appendChild(tableContainer);
        tableContainer.classList.add('threads-table');
        tableContainer.appendChild(createThreadsTable(collection.threads));

        resultList.appendChild(
            result.paginationBottom = Views.createPaginationControl(collection, onPageNumberChange, getLinkForPage));

        result.list = resultList;
        return result;
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

        let table = new DOMAppender('<table class="uk-table uk-table-divider uk-table-middle">', '</table>');

        let tableHeader = '<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Thread</th>\n' +
            '        <th class="uk-text-center thread-created-header uk-table-shrink">Added</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right latest-message-header">Latest Message</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);

        let tbody = new DOMAppender('<tbody>', '</tbody>');
        table.append(tbody);

        for (let thread of threads) {

            if (null == thread) continue;

            let row = new DOMAppender('<tr>', '</tr>');
            tbody.append(row);
            {
                let nameColumn = new DOMAppender('<td class="uk-table-expand">', '</td>');
                row.append(nameColumn);

                const iconClass = thread.visitedSinceLastChange ? 'uk-icon' : 'uk-icon-button';
                const icon = thread.pinned ? 'star' : 'forward';
                nameColumn.append(new DOMAppender(`<span class="${iconClass}" uk-icon="icon: ${icon}">`, '</span>'));

                let href = Pages.getThreadMessagesOfThreadUrlFull(thread);
                let data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;

                let threadLink = new DOMAppender(`<a class="uk-button uk-button-text" href="${href}" ${data}>`, '</a>');
                nameColumn.append(threadLink);
                threadLink.appendString(' ' + thread.name);

                let details = new DOMAppender('<div class="thread-tags">', '</div>');
                nameColumn.append(details);

                if (thread.voteScore < 0) {
                    details.appendRaw(`<span class="uk-label score-down">− ${DisplayHelpers.intToString(Math.abs(thread.voteScore))}</span>`);
                }
                else if (thread.voteScore == 0) {
                    details.appendRaw(`<span class="uk-label score-up">0</span>`);
                }
                else {
                    details.appendRaw(`<span class="uk-label score-up">+ ${DisplayHelpers.intToString(thread.voteScore)}</span>`);
                }
                details.appendRaw(' ');

                for (let tag of thread.tags) {

                    if (null == tag) continue;

                    details.append(TagsView.createTagElement(tag));
                    details.appendRaw(' ');
                }
            }
            {
                let createdColumn = new DOMAppender('<td class="thread-created uk-text-center uk-table-shrink">', '</td>');
                row.append(createdColumn);

                createdColumn.append(UsersView.createUserLogoSmall(thread.createdBy));
                createdColumn.append(UsersView.createAuthorSmall(thread.createdBy));

                createdColumn.appendRaw(('<div class="thread-message-time uk-text-meta">\n' +
                    '    <span>{Added}</span>\n' +
                    '</div>')
                    .replace('{Added}', DisplayHelpers.getDateTime(thread.created)));
            }
            {
                let statisticsColumn = ('<td class="thread-statistics uk-table-shrink">\n' +
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
                let latestMessageColumn = new DOMAppender('<td class="latest-message uk-text-center">', '</td>');
                row.append(latestMessageColumn);

                const latestMessage = thread.latestMessage;

                if (latestMessage) {

                    latestMessageColumn.append(UsersView.createUserLogoSmall(latestMessage.createdBy));

                    let authorElement = UsersView.createAuthorSmall(latestMessage.createdBy);
                    latestMessageColumn.append(authorElement);

                    let recentMessageTime = document.createElement('span');
                    recentMessageTime.classList.add('uk-text-meta');
                    recentMessageTime.innerText = DisplayHelpers.getDateTime(latestMessage.created);
                    authorElement.appendElement(recentMessageTime);

                    let messageContent = latestMessage.content || 'empty';

                    let messageLink = document.createElement('a');
                    messageLink.classList.add('recent-message-link');
                    messageLink.setAttribute('title', messageContent);
                    messageLink.setAttribute('href', Pages.getThreadMessagesOfMessageParentThreadUrlFull(latestMessage.id));
                    messageLink.setAttribute('data-threadmessagemessageid', latestMessage.id);
                    messageLink.innerText = messageContent;
                    latestMessageColumn.appendElement(messageLink);
                }
            }
        }

        let result = table.toElement();

        Views.setupCategoryLinks(result);
        Views.setupThreadsWithTagsLinks(result);
        Views.setupThreadsOfUsersLinks(result);
        Views.setupThreadMessagesOfUsersLinks(result);
        Views.setupThreadMessagesOfThreadsLinks(result);
        Views.setupThreadMessagesOfMessageParentThreadLinks(result);

        return result;
    }

    export function createRecentThreadsView(threads: ThreadRepository.Thread[]): HTMLElement {

        let result = new DOMAppender('<div>', '</div>');

        for (let thread of threads) {

            if (null === thread) continue;

            let element = new DOMAppender('<div class="recent-thread">', '</div>');
            result.append(element);

            let score = DisplayHelpers.intToString(Math.abs(thread.voteScore));

            if (0 === thread.voteScore) {

                element.appendRaw(`<span class="thread-vote neutral-vote" aria-expanded="false">0</span>`);
            }
            else if (thread.voteScore < 0) {

                element.appendRaw(`<span class="thread-vote down-vote" aria-expanded="false">−${score}</span>`);
            }
            else {
                element.appendRaw(`<span class="thread-vote up-vote" aria-expanded="false">+${score}</span>`);
            }

            let user = new DOMAppender('<span class="author">', '</span>');
            element.append(user);

            let userLink = new DOMAppender(`<a ${UsersView.getThreadsOfUserLinkContent(thread.createdBy)}>`, '</a>');
            user.append(userLink);
            userLink.appendString(thread.createdBy.name);

            let title = DOMHelpers.escapeStringForAttribute(thread.name);

            let href = Pages.getThreadMessagesOfThreadUrlFull(thread);
            let data = `data-threadmessagethreadid="${DOMHelpers.escapeStringForAttribute(thread.id)}"`;
            let link = new DOMAppender(`<a href="${href}" class="recent-thread-link" title="${title}" ${data}>`, '</a>');
            element.append(link);
            link.appendString(thread.name);
        }

        let resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);
        Views.setupThreadMessagesOfThreadsLinks(resultElement);
        Views.setupThreadMessagesOfMessageParentThreadLinks(resultElement);

        return resultElement;
    }

    export function createThreadPageHeader(thread: ThreadRepository.Thread,
                                           callback: IThreadCallback,
                                           privileges: IThreadPrivileges): HTMLElement {

        let element = document.createElement('div');
        element.classList.add('uk-container', 'uk-container-expand', 'thread-header');

        let card = document.createElement('div');
        element.appendChild(card);
        card.classList.add('uk-card', 'uk-card-body');

        {
        /* append to card:
        <a uk-icon="icon: settings" href="editThreadPrivileges" title="Edit thread access" uk-tooltip
           uk-toggle="target: #privileges-modal"></a>
        */
            let actions = document.createElement('div');
            card.appendChild(actions);
            actions.classList.add('thread-actions');

            let subscribeToThread = document.createElement('button');
            actions.appendChild(subscribeToThread);
            subscribeToThread.classList.add('uk-button', 'uk-button-primary', 'uk-button-small');
            subscribeToThread.innerText = 'Subscribe';

            actions.appendChild(document.createTextNode(' '));

            let unSubscribeFromThread = document.createElement('button');
            actions.appendChild(unSubscribeFromThread);
            unSubscribeFromThread.classList.add('uk-button', 'uk-button-danger', 'uk-button-small');
            unSubscribeFromThread.innerText = 'Unsubscribe';

            actions.appendChild(document.createTextNode(' '));

            DOMHelpers.hide(thread.subscribed ? subscribeToThread : unSubscribeFromThread);

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

            if (privileges.canDeleteThread(thread.id)) {

                let deleteLink = EditViews.createDeleteLink('Delete thread', '');
                actions.appendChild(deleteLink);

                deleteLink.addEventListener('click', () => {

                    if (EditViews.confirm(`Are you sure you want to delete the following thread: ${thread.name}?`)) {

                        EditViews.goToHomePageIfOk(callback.deleteThread(thread.id));
                    }
                });
            }
        }
        {
            let title = document.createElement('div');
            card.appendChild(title);
            title.classList.add('uk-align-left', 'thread-title');

            if (privileges.canEditThreadPinDisplayOrder(thread.id)) {
                let link = EditViews.createEditLink('Edit thread display order when pinned', 'star');
                title.appendChild(link);
                link.addEventListener('click', () => {

                    const newValue = parseInt(EditViews.getInput('Edit thread display order when pinned', (thread.pinDisplayOrder || 0).toString()));

                    if ((newValue >= 0) && (newValue != thread.pinDisplayOrder)) {

                        thread.pinDisplayOrder = newValue;
                        callback.editThreadPinDisplayOrder(thread.id, newValue);
                    }
                });
            }

            let threadTitle = document.createElement('span');
            if (privileges.canEditThreadName(thread.id)) {
                let link = EditViews.createEditLink('Edit thread name');
                title.appendChild(link);
                link.addEventListener('click', () => {

                    const name = EditViews.getInput('Edit thread name', thread.name);
                    if (name && name.length && (name != thread.name)) {

                        EditViews.doIfOk(callback.editThreadName(thread.id, name), () => {

                            threadTitle.innerText = thread.name = name;
                            refreshMath(threadTitle);
                        });
                    }
                });

            }
            title.appendChild(threadTitle);
            threadTitle.classList.add('uk-logo');

            threadTitle.innerText = thread.name;
            title.appendChild(document.createTextNode(' '));

            let userLink = DOMHelpers.parseHTML(`<a class="author" ${UsersView.getThreadsOfUserLinkContent(thread.createdBy)}></a>`);
            title.appendChild(userLink);
            userLink.innerText = thread.createdBy.name;
        }
        {
            card.appendChild(DOMHelpers.parseHTML('<div class="uk-clearfix"></div>'));
        }
        {
            let details = document.createElement('div');
            card.appendChild(details);
            details.classList.add('thread-details', 'uk-align-left');

            if (privileges.canEditThreadTags(thread.id)) {

                let link = EditViews.createEditLink('Edit thread tags', 'tag');
                details.appendChild(link);
                link.addEventListener('click', async () => {

                    const allTags = await callback.getAllTags();
                    TagsView.showSelectTagsDialog(thread.tags, allTags,
                        (added: string[], removed: string[]) => {

                            reloadPageIfOk(callback.editThreadTags(thread.id, added, removed));
                        });
                });
            }

            if (thread.tags && thread.tags.length){

                for (let tag of thread.tags) {

                    details.appendChild(TagsView.createTagElement(tag).toElement());
                    details.appendChild(document.createTextNode(' '));
                }
            }

            details.appendChild(DOMHelpers.parseHTML('<span>Displayed under: </span>'));
            if (thread.categories && thread.categories.length) {

                for (let category of thread.categories) {

                    let element = DOMHelpers.parseHTML('<a href="' +
                        Pages.getCategoryFullUrl(category) +
                        '" data-categoryid="' + DOMHelpers.escapeStringForAttribute(category.id) + '" data-categoryname="' +
                        DOMHelpers.escapeStringForAttribute(category.name) + '"></a>');
                    details.appendChild(element);
                    element.innerText = category.name;
                    details.appendChild(document.createTextNode(' · '));
                }
            }
            else {

                details.appendChild(DOMHelpers.parseHTML('<span class="uk-text-warning">&lt;none&gt;</span> · '));
            }
            details.appendChild(document.createTextNode(`${DisplayHelpers.intToString(thread.visited)} total views · `));

            let subscribedUsersLink = document.createElement('a');
            details.appendChild(subscribedUsersLink);
            subscribedUsersLink.innerText = `${DisplayHelpers.intToString(thread.subscribedUsersCount)} subscribed users`;
        }
        {
            card.appendChild(DOMHelpers.parseHTML('<div class="uk-clearfix"></div>'));
        }

        Views.setupThreadsWithTagsLinks(element);
        Views.setupThreadsOfUsersLinks(element);
        Views.setupCategoryLinks(element);

        return element;
    }
}