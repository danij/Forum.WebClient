import {Views} from "./common";
import {PageActions} from "../pages/action";
import {DOMHelpers} from "../helpers/domHelpers";
import {PrivilegesRepository} from "../services/privilegesRepository";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadRepository} from "../services/threadRepository";
import {TagRepository} from "../services/tagRepository";
import {CategoryRepository} from "../services/categoryRepository";
import {UsersView} from "./usersView";
import {UserRepository} from "../services/userRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";

export module PrivilegesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import RequiredPrivilegesCollection = PrivilegesRepository.RequiredPrivilegesCollection;
    import TabEntry = Views.TabEntry;
    import AssignedPrivilegesCollection = PrivilegesRepository.AssignedPrivilegesCollection;
    import AssignedPrivilege = PrivilegesRepository.AssignedPrivilege;

    const ThreadMessagePrivilegeNames = [

        ['view', 'View'],
        ['view_creator_user', 'View Creator User'],
        ['view_ip_address', 'View IP Address'],
        ['view_votes', 'View Votes'],
        ['up_vote', 'Up Vote'],
        ['down_vote', 'Down Vote'],
        ['reset_vote', ' Reset Vote'],
        ['add_comment', ' Add Comment'],
        ['get_message_comments', 'Get Message Comments'],
        ['set_comment_to_solved', 'Set Comment to Solved'],
        ['change_content', 'Change Content'],
        ['delete', 'Delete'],
        ['move', 'Move'],
        ['adjust_privilege', 'Adjust Privileges'],
    ];

    const ThreadPrivilegeNames = [

        ['view', 'View'],
        ['subscribe', 'Subscribe'],
        ['unsubscribe', 'Unsubscribe'],
        ['add_message', 'Add Message'],
        ['change_name', 'Change Name'],
        ['change_pin_display_order', 'Change Pin Display Order'],
        ['add_tag', 'Add Tag'],
        ['remove_tag', 'Remove Tag'],
        ['delete', 'Delete'],
        ['merge', 'Merge'],
        ['adjust_privilege', 'Adjust Privileges'],
    ];

    const TagPrivilegeNames = [

        ['view', 'View'],
        ['get_discussion_threads', 'Get Threads'],
        ['change_name', 'Change Name'],
        //['change_uiblob', 'Change UI Blob'],
        ['delete', 'Delete'],
        ['merge', 'Merge'],
        ['adjust_privilege', 'Adjust Privileges'],
    ];

    const CategoryPrivilegeNames = [

        ['view', 'View'],
        ['get_discussion_threads', 'Get Threads'],
        ['change_name', 'Change Name'],
        ['change_description', 'Change Description'],
        ['change_parent', 'Change Parent'],
        ['change_displayorder', 'Change Displayorder'],
        ['add_tag', 'Add Tag'],
        ['remove_tag', 'Remove Tag'],
        ['delete', 'Delete'],
        ['adjust_privilege', 'Adjust Privileges'],
    ];

    const ForumWidePrivilegeNames = [

        ['add_user', 'Add User'],
        ['login', 'Login'],
        ['get_entities_count', 'Get Entities Count'],
        ['get_version', 'Get Version'],
        ['get_all_users', 'Get All Users'],
        ['get_user_info', 'Get User Info'],
        ['get_discussion_threads_of_user', 'Get Threads Of User'],
        ['get_discussion_thread_messages_of_user', 'Get Thread Messages Of User'],
        ['get_subscribed_discussion_threads_of_user', 'Get Subscribed Threads Of User'],
        ['get_all_discussion_categories', 'Get All Categories'],
        ['get_discussion_categories_from_root', 'Get Root Categories'],
        ['get_all_discussion_tags', 'Get All Tags'],
        ['get_all_discussion_threads', 'Get All Threads'],
        ['get_all_message_comments', 'Get All Message Comments'],
        ['get_message_comments_of_user', 'Get Message Comments Of User'],
        ['add_discussion_category', 'Add Category'],
        ['add_discussion_tag', 'Add Tag'],
        ['add_discussion_thread', 'Add Thread'],
        ['change_own_user_name', 'Change Own User Name'],
        ['change_any_user_name', 'Change Any User Name'],
        ['change_own_user_info', 'Change Own User Info'],
        ['change_any_user_info', 'Change Any User Info'],
        ['change_own_user_title', 'Change Own User Title'],
        ['change_any_user_title', 'Change Any User Title'],
        ['change_own_user_signature', 'Change Own User Signature'],
        ['change_any_user_signature', 'Change Any User Signature'],
        ['change_own_user_logo', 'Change Own User Logo'],
        ['change_any_user_logo', 'Change Any User Logo'],
        ['delete_own_user_logo', 'Delete Own User Logo'],
        ['delete_any_user_logo', 'Delete Any User Logo'],
        ['delete_any_user', 'Delete Any User'],
        ['adjust_forum_wide_privilege', 'Adjust Privileges'],
        ['get_user_vote_history', 'Get User Vote History'],
        ['no_throttling', 'No Throttling Exception'],
    ];

    const Columns = [

        ['discussionThreadMessagePrivileges', 'Message'],
        ['discussionThreadPrivileges', 'Thread'],
        ['discussionTagPrivileges', 'Tag'],
        ['discussionCategoryPrivileges', 'Category'],
        ['forumWidePrivileges', 'Forum Wide'],
    ];

    function showPrivilegesModal(title: string): HTMLElement {

        let modal = document.getElementById('privileges-modal');

        (modal.getElementsByClassName('uk-modal-title')[0] as HTMLElement).innerText = title;

        Views.showModal(modal);

        return modal;
    }

    export function showThreadMessagePrivileges(message: ThreadMessageRepository.ThreadMessage,
                                                callback: PageActions.IPrivilegesCallback): void {

        let modal = showPrivilegesModal('Privileges For Thread Message');

        const threadMessageRequiredPrivilegesPromises = [

            callback.getThreadMessageRequiredPrivileges(message.id),
            callback.getThreadRequiredPrivileges(message.parentThread.id)
        ];
        for (let tag of message.parentThread.tags) {

            threadMessageRequiredPrivilegesPromises.push(callback.getTagRequiredPrivileges(tag.id));
        }
        threadMessageRequiredPrivilegesPromises.push(callback.getForumWideRequiredPrivileges());

        showRequiredPrivileges(modal, Promise.all(threadMessageRequiredPrivilegesPromises));

        showAssignedPrivileges(modal, callback.getThreadMessageAssignedPrivileges(message.id));
    }

    export function showThreadPrivileges(thread: ThreadRepository.Thread,
                                         callback: PageActions.IPrivilegesCallback): void {

        let modal = showPrivilegesModal('Privileges For Thread: ' + thread.name);

        const requiredPrivilegesPromises = [

            callback.getThreadRequiredPrivileges(thread.id)
        ];
        for (let tag of thread.tags) {

            requiredPrivilegesPromises.push(callback.getTagRequiredPrivileges(tag.id));
        }
        requiredPrivilegesPromises.push(callback.getForumWideRequiredPrivileges());

        showRequiredPrivileges(modal, Promise.all(requiredPrivilegesPromises), Promise.all(requiredPrivilegesPromises));

        showAssignedPrivileges(modal, callback.getThreadAssignedPrivileges(thread.id));
    }

    export function showTagPrivileges(tag: TagRepository.Tag, callback: PageActions.IPrivilegesCallback): void {

        let modal = showPrivilegesModal('Privileges For Tag: ' + tag.name);

        const requiredPrivilegesPromises = [

            callback.getTagRequiredPrivileges(tag.id),
            callback.getForumWideRequiredPrivileges()
        ];

        showRequiredPrivileges(modal, Promise.all(requiredPrivilegesPromises), Promise.all(requiredPrivilegesPromises),
            Promise.all(requiredPrivilegesPromises));

        showAssignedPrivileges(modal, callback.getTagAssignedPrivileges(tag.id));
    }

    export function showCategoryPrivileges(category: CategoryRepository.Category,
                                           callback: PageActions.IPrivilegesCallback): void {

        let modal = showPrivilegesModal('Privileges For Category: ' + category.name);

        const requiredPrivilegesPromises = [

            callback.getCategoryRequiredPrivileges(category.id),
            callback.getForumWideRequiredPrivileges()
        ];

        showRequiredPrivileges(modal, null, null, null,
            Promise.all(requiredPrivilegesPromises));

        showAssignedPrivileges(modal, callback.getCategoryAssignedPrivileges(category.id));
    }

    export function showForumWidePrivileges(callback: PageActions.IPrivilegesCallback): void {

        let modal = showPrivilegesModal('Forum Wide Privileges');

        Views.showModal(modal);

        const requiredPrivilegesPromises = [

            callback.getForumWideRequiredPrivileges()
        ];

        let promise = Promise.all(requiredPrivilegesPromises);

        showRequiredPrivileges(modal, promise, promise, promise, promise, promise);

        showAssignedPrivileges(modal, callback.getForumWideAssignedPrivileges());
    }

    function showRequiredPrivileges(modal: HTMLElement,
                                    threadMessageRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    threadRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    tagRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    categoryRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    forumWideRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>): void {

        let toReplace = modal.getElementsByClassName('required-privileges')[0] as HTMLElement;
        toReplace.innerText = '';

        Views.changeContent(toReplace, async () => {

            let tabEntries: TabEntry[] = [];

            if (threadMessageRequiredPrivileges) {

                tabEntries.push(createdRequiredPrivilegesTable('Thread Message Required Levels',
                    ThreadMessagePrivilegeNames, await threadMessageRequiredPrivileges,
                    'discussionThreadMessagePrivileges'));
            }
            if (threadRequiredPrivileges) {

                tabEntries.push(createdRequiredPrivilegesTable('Thread Required Levels',
                    ThreadPrivilegeNames, await threadRequiredPrivileges,
                    'discussionThreadPrivileges'));
            }
            if (tagRequiredPrivileges) {

                tabEntries.push(createdRequiredPrivilegesTable('Tag Required Levels',
                    TagPrivilegeNames, await tagRequiredPrivileges,
                    'discussionTagPrivileges'));
            }
            if (categoryRequiredPrivileges) {

                tabEntries.push(createdRequiredPrivilegesTable('Category Required Levels',
                    CategoryPrivilegeNames, await categoryRequiredPrivileges,
                    'discussionCategoryPrivileges'));
            }
            if (forumWideRequiredPrivileges) {

                tabEntries.push(createdRequiredPrivilegesTable('Forum Wide Required Levels',
                    ForumWidePrivilegeNames, await forumWideRequiredPrivileges,
                    'forumWidePrivileges'));
            }

            const result = Views.createTabs(tabEntries, 0, 'center');

            return result;

        }, false);
    }

    function createdRequiredPrivilegesTable(title: string, privilegeNames,
                                            values: RequiredPrivilegesCollection[], property: string): TabEntry {

        let tableAppender = new DOMAppender('<table class="uk-column-divider uk-table uk-table-divier uk-table-small uk-table-striped">', '</table>');

        let result: TabEntry = {

            title: title,
            content: tableAppender
        };

        let columnValues = {};

        for (const column of Columns) {

            columnValues[column[0]] = [];
        }

        for (let collection of values) {

            if (collection[property]) {

                const toKeep = collection[property];

                for (let i = Columns.length - 1; i >= 0; --i) {

                    //a collection retrieved from a tag contains values for the tag, threads and thread messages
                    //use this information to place the collection in the Tag column
                    if (collection[Columns[i][0]]) {

                        columnValues[Columns[i][0]].push(toKeep);
                        break;
                    }
                }
            }
        }

        let tHead = new DOMAppender('<thead>', '</thead>');
        tableAppender.append(tHead);
        {
            let row = new DOMAppender('<tr>', '</tr>');
            tHead.append(row);

            row.appendRaw('<th>Privilege</th>');

            for (const column of Columns) {

                if (columnValues[column[0]].length) {

                    let cell = new DOMAppender('<th>', '</th>');
                    row.append(cell);
                    cell.appendString(column[1]);
                }
            }
        }

        let tBody = new DOMAppender('<tbody>', '</tbody>');
        tableAppender.append(tBody);

        function getValuesForPrivilege(privilegeName: string) {

            let result = [];

            for (const column of Columns) {

                if (columnValues[column[0]].length) {

                    let currentResultValues = [];

                    for (const values of columnValues[column[0]]) {

                        for (const pair of values) {

                            if (pair.name == privilegeName) {

                                currentResultValues.push(pair.value);
                            }
                        }
                    }

                    if (currentResultValues.length == 0) {

                        result.push('-');
                    }
                    else {

                        result.push(Math.max(...currentResultValues).toString());
                    }
                }
            }
            return result;
        }

        for (let privilegeName of privilegeNames) {

            let row = new DOMAppender('<tr>', '</tr>');
            tBody.append(row);

            let nameCell = new DOMAppender('<td>', '</td>');
            row.append(nameCell);
            nameCell.appendString(privilegeName[1]);

            let columnMaxValues = getValuesForPrivilege(privilegeName[0]);

            for (const value of columnMaxValues) {

                let cell = new DOMAppender('<td>', '</td>');
                row.append(cell);

                cell.appendString(value);
            }
        }

        return result;
    }

    function showAssignedPrivileges(modal: HTMLElement, promise: Promise<AssignedPrivilegesCollection>): void {

        let toReplace = modal.getElementsByClassName('assigned-privileges')[0] as HTMLElement;
        toReplace.innerText = '';

        Views.changeContent(toReplace, async () => {

            let tabEntries: TabEntry[] = [];

            let collection = await promise;

            let now = collection.now;
            let assignedPrivileges = collection.forumWidePrivileges
                || collection.discussionCategoryPrivileges
                || collection.discussionTagPrivileges
                || collection.discussionThreadPrivileges
                || collection.discussionThreadMessagePrivileges;

            let granted: AssignedPrivilege[] = [];
            let grantedExpired: AssignedPrivilege[] = [];
            let revoked: AssignedPrivilege[] = [];
            let revokedExpired: AssignedPrivilege[] = [];

            assignedPrivileges.sort((first, second) => first.granted - second.granted);

            function expired(assignedPrivilege: AssignedPrivilege): boolean {

                return (assignedPrivilege.expires > 0) && (assignedPrivilege.expires < now);
            }

            for (const assignedPrivilege of assignedPrivileges) {

                if (assignedPrivilege.value > 0) {

                    if (expired(assignedPrivilege)) {

                        grantedExpired.push(assignedPrivilege);
                    }
                    else {

                        granted.push(assignedPrivilege);
                    }
                }
                else {

                    if (expired(assignedPrivilege)) {

                        revokedExpired.push(assignedPrivilege);
                    }
                    else {

                        revoked.push(assignedPrivilege);
                    }
                }
            }

            if (granted.length) {

                tabEntries.push(createAssignedPrivilegesTable('Granted Levels', granted));
            }

            if (grantedExpired.length) {

                tabEntries.push(createAssignedPrivilegesTable('Granted Levels (Expired)', grantedExpired));
            }

            if (revoked.length) {

                tabEntries.push(createAssignedPrivilegesTable('Revoked Levels', revoked));
            }

            if (revokedExpired.length) {

                tabEntries.push(createAssignedPrivilegesTable('Revoked Levels (Expired)', revokedExpired));
            }

            const result = Views.createTabs(tabEntries, 0, 'center');

            Views.setupThreadsOfUsersLinks(result);

            return result;

        }, false);
    }

    function createAssignedPrivilegesTable(title: string, assignedPrivileges: AssignedPrivilege[]): TabEntry {

        let tableAppender = new DOMAppender('<table class="uk-column-divider uk-table uk-table-divier uk-table-small uk-table-striped">', '</table>');

        let result: TabEntry = {

            title: title,
            content: tableAppender
        };

        let tHead = new DOMAppender('<thead>', '</thead>');
        tableAppender.append(tHead);
        {
            let row = new DOMAppender('<tr>', '</tr>');
            tHead.append(row);

            row.appendRaw('<th>User</th>');
            row.appendRaw('<th>Level</th>');
            row.appendRaw('<th>From</th>');
            row.appendRaw('<th>Until</th>');
        }

        let tBody = new DOMAppender('<tbody>', '</tbody>');
        tableAppender.append(tBody);

        for (let assignedPrivilege of assignedPrivileges) {

            let row = new DOMAppender('<tr>', '</tr>');
            tBody.append(row);

            let userCell = new DOMAppender('<td>', '</td>');
            row.append(userCell);

            userCell.append(UsersView.createAuthorSmall({
                id: assignedPrivilege.id,
                name: assignedPrivilege.name
            } as UserRepository.User));

            let labelCell = new DOMAppender('<td>', '</td>');
            row.append(labelCell);
            labelCell.appendString(assignedPrivilege.value.toString());

            let fromCell = new DOMAppender('<td>', '</td>');
            row.append(fromCell);
            fromCell.appendString(DisplayHelpers.getDateTime(assignedPrivilege.granted));

            let untilCell = new DOMAppender('<td>', '</td>');
            row.append(untilCell);
            untilCell.appendString((0 == assignedPrivilege.expires)
                ? '∞'
                : DisplayHelpers.getDateTime(assignedPrivilege.expires));
        }

        return result;
    }

}