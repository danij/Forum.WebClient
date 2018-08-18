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
import {ViewsExtra} from "./extra";
import {CategoriesView} from "./categoriesView";
import {TagsView} from "./tagsView";
import {ThreadsView} from "./threadsView";
import {Privileges} from "../services/privileges";
import {Debug} from "../services/debug";

export module PrivilegesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import RequiredPrivilegesCollection = PrivilegesRepository.RequiredPrivilegesCollection;
    import AssignedPrivilegesCollection = PrivilegesRepository.AssignedPrivilegesCollection;
    import AssignedPrivilege = PrivilegesRepository.AssignedPrivilege;

    const ThreadMessagePrivilegeNames = [

        ['view', 'View'],
        ['view_required_privileges', 'View Required Privileges'],
        ['view_assigned_privileges', 'View Assigned Privileges'],
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
        ['view_required_privileges', 'View Required Privileges'],
        ['view_assigned_privileges', 'View Assigned Privileges'],
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
        ['view_required_privileges', 'View Required Privileges'],
        ['view_assigned_privileges', 'View Assigned Privileges'],
        ['get_discussion_threads', 'Get Threads'],
        ['change_name', 'Change Name'],
        //['change_uiblob', 'Change UI Blob'],
        ['delete', 'Delete'],
        ['merge', 'Merge'],
        ['adjust_privilege', 'Adjust Privileges'],
    ];

    const CategoryPrivilegeNames = [

        ['view', 'View'],
        ['view_required_privileges', 'View Required Privileges'],
        ['view_assigned_privileges', 'View Assigned Privileges'],
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
        ['view_forum_wide_required_privileges', 'View Forum Wide Required Privileges'],
        ['view_forum_wide_assigned_privileges', 'View Forum Wide Assigned Privileges'],
        ['view_user_assigned_privileges', 'View User Assigned Privileges'],
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

    const PrivilegeTypeMapping = {

        'discussionThreadMessagePrivileges': 'thread_message',
        'discussionThreadPrivileges': 'thread',
        'discussionTagPrivileges': 'tag',
        'discussionCategoryPrivileges': 'category',
        'forumWidePrivileges': 'forum_wide',
    };

    const EntityToColumnMapping = {

        'thread_message': 'discussionThreadMessagePrivileges',
        'thread': 'discussionThreadPrivileges',
        'tag': 'discussionTagPrivileges',
        'category': 'discussionCategoryPrivileges',
        'forum_wide': 'forumWidePrivileges'
    };

    const ValueMin = -32000;

    const ValueMax = 32000;

    interface ColumnEntityAllowEditRequired {

        entityType: string;
        entityId: string;
        allowAdjustPrivilege: boolean;
    }

    function showPrivilegesModal(title: string): HTMLElement {

        const modal = document.getElementById('privileges-modal');

        const titleElement = modal.getElementsByClassName('uk-modal-title')[0] as HTMLElement;
        titleElement.innerText = title;

        for (let i = 0; i < 2; i++) {

            const toReplace = modal.getElementsByClassName(`privileges-part${i + 1}`)[0] as HTMLElement;
            toReplace.innerText = '';
        }

        ViewsExtra.refreshMath(titleElement);

        Views.showModal(modal);

        return modal;
    }

    function createPrivilegeLevelSpan(value: string): DOMAppender {

        const result = dA('<span class="privilege-level">');
        result.appendString(value);

        return result;
    }

    function createEditPrivilegeRequiredValue(privilegeType: string, entityAllowEdit: ColumnEntityAllowEditRequired[],
                                              privilegeName: string, currentValue: string): DOMAppender {

        const allowEdit = entityAllowEdit && (1 == entityAllowEdit.length)
            && (entityAllowEdit[0].allowAdjustPrivilege || Debug.enableAllPrivileges());

        if (! allowEdit) {

            return null;
        }

        const dataValues = {
            'data-privilege-type': privilegeType,
            'data-privilege-entity-type': entityAllowEdit[0].entityType,
            'data-privilege-entity-id': entityAllowEdit[0].entityId || '',
            'data-privilege-name': privilegeName,
            'data-privilege-initial-value': currentValue
        };

        const result = dA('span');

        const editButton = dA(`<span class="edit-required-privilege" title="Edit" ${DOMHelpers.concatAttributes(dataValues)}>`);
        result.append(editButton);
        editButton.appendRaw('<span uk-icon="pencil" class="edit-required-privilege-button pointer-cursor"></span>');

        const editInput = dA(`<input class="edit-required-privilege-input uk-hidden" value="${currentValue.toString()}" />`);
        result.append(editInput);

        const saveButton = dA('<span class="edit-required-privilege-save uk-hidden" title="Save">');
        result.append(saveButton);
        saveButton.appendRaw('<span uk-icon="check" class="edit-required-privilege-button pointer-cursor"></span>');

        const cancelButton = dA('<span class="edit-required-privilege-cancel uk-hidden" title="Cancel">');
        result.append(cancelButton);
        cancelButton.appendRaw('<span uk-icon="close" class="edit-required-privilege-button pointer-cursor"></span>');

        return result;
    }

    function setupEditPrivilegeRequiredValueButtons(element: HTMLElement): void {

        const editButtons = element.getElementsByClassName('edit-required-privilege');

        DOMHelpers.forEach(editButtons, setupEditPrivilegeRequiredValueButton);
    }

    function setupEditPrivilegeRequiredValueButton(editButton: HTMLElement): void {

        const tableCell = DOMHelpers.goUpUntil(editButton, 'td');

        const privilegeLevel = tableCell.getElementsByClassName('privilege-level')[0] as HTMLElement;
        const editInput = tableCell.getElementsByClassName('edit-required-privilege-input')[0] as HTMLInputElement;
        const saveButton = tableCell.getElementsByClassName('edit-required-privilege-save')[0] as HTMLElement;
        const cancelButton = tableCell.getElementsByClassName('edit-required-privilege-cancel')[0] as HTMLElement;

        const elements: HTMLElement[] = [privilegeLevel, editButton, editInput, saveButton, cancelButton];

        const privilegeType = editButton.getAttribute('data-privilege-type');
        const entityType = editButton.getAttribute('data-privilege-entity-type');
        const entityId = editButton.getAttribute('data-privilege-entity-id');
        const privilegeName = editButton.getAttribute('data-privilege-name');
        const initialValue = editButton.getAttribute('data-privilege-initial-value');

        Views.onClick(editButton, () => { DOMHelpers.switchHidden(elements); });

        Views.onClick(saveButton, async () => {

            const valueString = editInput.value.trim();
            const value = parseInt(valueString);

            if ((value.toString() != valueString) || (value < ValueMin) || (value > ValueMax)) {

                Views.showWarningNotification(`Value must be between ${ValueMin} and ${ValueMax}!`);
                return;
            }

            try {

                if (valueString != initialValue) {

                    await PrivilegesRepository.changeRequiredPrivilege(privilegeType, entityType, entityId,
                        privilegeName, value);

                    privilegeLevel.innerText = DisplayHelpers.intToStringLargeMinus(value);
                }
                DOMHelpers.switchHidden(elements);
            }
            catch (ex) {

                Views.showDangerNotification(`Could not assign privilege: ${ex}`)
            }
        });

        Views.onClick(cancelButton, () => { DOMHelpers.switchHidden(elements); });
    }

    export function showThreadMessagePrivileges(message: ThreadMessageRepository.ThreadMessage,
                                                callback: PageActions.IPrivilegesCallback): void {

        const modal = showPrivilegesModal('Privileges For Thread Message');

        const threadMessageRequiredPrivilegesPromises = [

            callback.getThreadMessageRequiredPrivileges(message.id),
            callback.getThreadRequiredPrivileges(message.parentThread.id)
        ];
        for (let tag of message.parentThread.tags) {

            threadMessageRequiredPrivilegesPromises.push(callback.getTagRequiredPrivileges(tag.id));
        }
        threadMessageRequiredPrivilegesPromises.push(callback.getForumWideRequiredPrivileges());

        if (Privileges.ThreadMessage.canViewThreadMessageRequiredPrivileges(message)) {

            showRequiredPrivileges(modal, Promise.all(threadMessageRequiredPrivilegesPromises));
        }
        if (Privileges.ThreadMessage.canViewThreadMessageAssignedPrivileges(message)) {

            showAssignedPrivileges(modal, callback.getThreadMessageAssignedPrivileges(message.id), message.id);
        }
    }

    export function showThreadPrivileges(thread: ThreadRepository.Thread,
                                         callback: PageActions.IPrivilegesCallback): void {

        const modal = showPrivilegesModal('Privileges For Thread: ' + thread.name);

        const requiredPrivilegesPromises = [

            callback.getThreadRequiredPrivileges(thread.id)
        ];
        for (let tag of thread.tags) {

            requiredPrivilegesPromises.push(callback.getTagRequiredPrivileges(tag.id));
        }
        requiredPrivilegesPromises.push(callback.getForumWideRequiredPrivileges());

        if (Privileges.Thread.canViewThreadRequiredPrivileges(thread)) {

            showRequiredPrivileges(modal, Promise.all(requiredPrivilegesPromises), Promise.all(requiredPrivilegesPromises));
        }
        if (Privileges.Thread.canViewThreadAssignedPrivileges(thread)) {

            showAssignedPrivileges(modal, callback.getThreadAssignedPrivileges(thread.id), thread.id);
        }
    }

    export function showTagPrivileges(tag: TagRepository.Tag, callback: PageActions.IPrivilegesCallback): void {

        const modal = showPrivilegesModal('Privileges For Tag: ' + tag.name);

        const requiredPrivilegesPromises = [

            callback.getTagRequiredPrivileges(tag.id),
            callback.getForumWideRequiredPrivileges()
        ];

        if (Privileges.Tag.canViewTagRequiredPrivileges(tag)) {

            showRequiredPrivileges(modal, Promise.all(requiredPrivilegesPromises), Promise.all(requiredPrivilegesPromises),
                Promise.all(requiredPrivilegesPromises));
        }
        if (Privileges.Tag.canViewTagAssignedPrivileges(tag)) {

            showAssignedPrivileges(modal, callback.getTagAssignedPrivileges(tag.id), tag.id);
        }
    }

    export function showCategoryPrivileges(category: CategoryRepository.Category,
                                           callback: PageActions.IPrivilegesCallback): void {

        const modal = showPrivilegesModal('Privileges For Category: ' + category.name);

        const requiredPrivilegesPromises = [

            callback.getCategoryRequiredPrivileges(category.id),
            callback.getForumWideRequiredPrivileges()
        ];

        if (Privileges.Category.canViewCategoryRequiredPrivileges(category)) {

            showRequiredPrivileges(modal, null, null, null,
                Promise.all(requiredPrivilegesPromises));
        }
        if (Privileges.Category.canViewCategoryAssignedPrivileges(category)) {

            showAssignedPrivileges(modal, callback.getCategoryAssignedPrivileges(category.id), category.id);
        }
    }

    export function showForumWidePrivileges(callback: PageActions.IPrivilegesCallback): void {

        const modal = showPrivilegesModal('Forum Wide Privileges');

        Views.showModal(modal);

        const requiredPrivilegesPromises = [

            callback.getForumWideRequiredPrivileges()
        ];

        const promise = Promise.all(requiredPrivilegesPromises);

        if (Privileges.ForumWide.canViewForumWideRequiredPrivileges()) {

            showRequiredPrivileges(modal, promise, promise, promise, promise, promise);
        }
        if (Privileges.ForumWide.canViewForumWideAssignedPrivileges()) {

            showAssignedPrivileges(modal, callback.getForumWideAssignedPrivileges(), '');
        }
    }

    function showRequiredPrivileges(modal: HTMLElement,
                                    threadMessageRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    threadRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    tagRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    categoryRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    forumWideRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>): void {

        const toReplace = modal.getElementsByClassName('privileges-part1')[0] as HTMLElement;
        toReplace.innerText = '';

        Views.changeContent(toReplace, async () => {

            const tabEntries: Views.TabEntry[] = [];

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

            return Views.createTabs(tabEntries, 0, 'center').toElement();

        }, false);

        setTimeout(() => setupEditPrivilegeRequiredValueButtons(toReplace), 1000);
    }

    function createdRequiredPrivilegesTable(title: string, privilegeNames,
                                            values: RequiredPrivilegesCollection[], property: string): Views.TabEntry {

        const tableAppender = dA('<table class="uk-column-divider uk-table uk-table-divier uk-table-small uk-table-striped">');

        const result: Views.TabEntry = {

            title: title,
            content: tableAppender
        };

        const columnValues = {};

        for (const column of Columns) {

            columnValues[column[0]] = [];
        }

        const entityAllowEditPrivileges = {};

        for (let column of Columns) {

            entityAllowEditPrivileges[column[0]] = [];
        }

        for (const value of values) {

            entityAllowEditPrivileges[EntityToColumnMapping[value.entityType]].push({

                entityType: value.entityType,
                entityId: value.entityId,
                allowAdjustPrivilege: value.allowAdjustPrivilege
            });
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

        const tHead = dA('<thead>');
        tableAppender.append(tHead);
        {
            const row = dA('<tr>');
            tHead.append(row);

            row.appendRaw('<th>Privilege</th>');

            for (const column of Columns) {

                if (columnValues[column[0]].length) {

                    const cell = dA('<th>');
                    row.append(cell);
                    cell.appendString(column[1]);
                }
            }
        }

        const tBody = dA('<tbody>');
        tableAppender.append(tBody);

        function getValuesForPrivilege(privilegeName: string) {

            const result = [];

            for (const column of Columns) {

                if (columnValues[column[0]].length) {

                    const currentResultValues = [];

                    for (const values of columnValues[column[0]]) {

                        for (const pair of values) {

                            if (pair.name == privilegeName) {

                                currentResultValues.push(pair.value);
                            }
                        }
                    }

                    let valueStringSimple = '';
                    let valueString = '';

                    if (currentResultValues.length == 0) {

                        valueString = '-';
                    }
                    else {

                        const value = Math.max(...currentResultValues);
                        valueStringSimple = value.toString();
                        valueString = DisplayHelpers.intToStringLargeMinus(value);
                    }

                    result.push(DOMHelpers.wrapIfMultiple(
                        createPrivilegeLevelSpan(valueString),
                        createEditPrivilegeRequiredValue(PrivilegeTypeMapping[property],
                            entityAllowEditPrivileges[column[0]], privilegeName, valueStringSimple)));
                }
            }
            return result;
        }

        for (let privilegeName of privilegeNames) {

            const row = dA('<tr>');
            tBody.append(row);

            const nameCell = dA('<td>');
            row.append(nameCell);
            nameCell.appendString(privilegeName[1]);

            const columnMaxValues = getValuesForPrivilege(privilegeName[0]);

            for (const value of columnMaxValues) {

                const cell = dA('<td>');
                row.append(cell);

                cell.append(value);
            }
        }

        return result;
    }

    function showAssignedPrivileges(modal: HTMLElement, promise: Promise<AssignedPrivilegesCollection>,
                                    entityId: string): void {

        const toReplace = modal.getElementsByClassName('privileges-part2')[0] as HTMLElement;
        toReplace.innerText = '';

        Views.changeContent(toReplace, async () => {

            const tabEntries: Views.TabEntry[] = [];

            const collection = await promise;

            const now = collection.now;
            const assignedPrivileges = collection.forumWidePrivileges
                || collection.discussionCategoryPrivileges
                || collection.discussionTagPrivileges
                || collection.discussionThreadPrivileges
                || collection.discussionThreadMessagePrivileges;


            const appender = dA('div');

            appender.append(createAssignPrivilegeForm(collection, entityId));

            function expired(assignedPrivilege: AssignedPrivilege): boolean {

                return (assignedPrivilege.expires > 0) && (assignedPrivilege.expires < now);
            }

            function getUserLink(assignedPrivilege: AssignedPrivilege): DOMAppender {

                return UsersView.createAuthorSmall({

                    id: assignedPrivilege.id,
                    name: assignedPrivilege.name
                } as UserRepository.User);
            }

            if (0 == assignedPrivileges.length) {

                appender.appendRaw('<span class="uk-text-warning">No privileges assigned</span>');
            }
            else {

                const granted: AssignedPrivilege[] = [];
                const grantedExpired: AssignedPrivilege[] = [];
                const revoked: AssignedPrivilege[] = [];
                const revokedExpired: AssignedPrivilege[] = [];

                assignedPrivileges.sort((first, second) => first.granted - second.granted);

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

                const columnName = 'User';

                if (granted.length) {

                    tabEntries.push(createAssignedPrivilegesTable('Granted Levels', granted, columnName, getUserLink));
                }

                if (grantedExpired.length) {

                    tabEntries.push(createAssignedPrivilegesTable('Granted Levels (Expired)', grantedExpired,
                        columnName, getUserLink));
                }

                if (revoked.length) {

                    tabEntries.push(createAssignedPrivilegesTable('Revoked Levels', revoked, columnName, getUserLink));
                }

                if (revokedExpired.length) {

                    tabEntries.push(createAssignedPrivilegesTable('Revoked Levels (Expired)', revokedExpired,
                        columnName, getUserLink));
                }

                appender.append(Views.createTabs(tabEntries, 0, 'center'));
            }
            const result = appender.toElement();

            setupAssignPrivilegeForm(result);

            Views.setupThreadsOfUsersLinks(result);

            return result;

        }, false);
    }

    function createAssignedPrivilegesTable(title: string, assignedPrivileges: AssignedPrivilege[],
                                           firstColumn: string,
                                           firstColumnCallback: (AssignedPrivilege) => DOMAppender): Views.TabEntry {

        const tableAppender = dA('<table class="uk-column-divider uk-table uk-table-divier uk-table-small uk-table-striped">');

        const result: Views.TabEntry = {

            title: title,
            content: tableAppender
        };

        const tHead = dA('<thead>');
        tableAppender.append(tHead);
        {
            const row = dA('<tr>');
            tHead.append(row);

            if (firstColumn && firstColumn.length) {

                row.appendRaw(`<th>${firstColumn}</th>`);
            }
            row.appendRaw('<th>Level</th>');
            row.appendRaw('<th>From</th>');
            row.appendRaw('<th>Until</th>');
        }

        const tBody = dA('<tbody>');
        tableAppender.append(tBody);

        for (const assignedPrivilege of assignedPrivileges) {

            const row = dA('<tr>');
            tBody.append(row);

            if (firstColumnCallback) {

                const firstCell = dA('<td>');
                row.append(firstCell);
                firstCell.append(firstColumnCallback(assignedPrivilege));
            }

            const labelCell = dA('<td>');
            row.append(labelCell);
            labelCell.append(createPrivilegeLevelSpan(DisplayHelpers.intToStringLargeMinus(assignedPrivilege.value)));

            const fromCell = dA('<td>');
            row.append(fromCell);
            fromCell.appendString(DisplayHelpers.getDateTimeLargeSeparator(assignedPrivilege.granted));

            const untilCell = dA('<td>');
            row.append(untilCell);
            untilCell.appendString((0 == assignedPrivilege.expires)
                ? '∞'
                : DisplayHelpers.getDateTimeLargeSeparator(assignedPrivilege.expires));
        }

        return result;
    }

    function createAssignPrivilegeForm(collection: AssignedPrivilegesCollection, entityId: string): DOMAppender {

        if (! (collection.allowAdjustPrivilege || Debug.enableAllPrivileges())) {

            return null;
        }

        let assignType = '';

        if (collection.discussionThreadMessagePrivileges) {
            assignType = 'thread-message';
        }
        else if (collection.discussionThreadPrivileges) {
            assignType = 'thread';
        }
        else if (collection.discussionTagPrivileges) {
            assignType = 'tag';
        }
        else if (collection.discussionCategoryPrivileges) {
            assignType = 'category';
        }
        else if (collection.forumWidePrivileges) {
            assignType = 'forum-wide';
        }
        else {
            console.error('Invalid AssignedPrivilegesCollection');
            return null;
        }

        const dataAssignType = `data-assign-type=${assignType}`;
        const dataEntityId = `data-entity-id=${DOMHelpers.escapeStringForAttribute(entityId)}`;

        const form = dA(`<form class="assign-privileges-form" ${dataAssignType} ${dataEntityId}>`);
        const grid = dA('<div class="uk-grid-small uk-child-width-auto uk-grid">');
        form.append(grid);

        grid.appendRaw('<label for="user-input-assign-privilege">User name:</label><input type="text" id="user-input-assign-privilege" class="uk-input uk-form-small" />');
        grid.appendRaw('<label for="value-input-assign-privilege">Level:</label><input type="text" id="value-input-assign-privilege" class="uk-input uk-form-small uk-text-right" value="0" />')
        grid.appendRaw('<label for="duration-input-assign-privilege">Duration:</label><input type="text" id="duration-input-assign-privilege" class="uk-input uk-form-small uk-text-center" placeholder="unlimited" />')

        const durationSelect = dA('<select id="duration-type-assign-privilege" class="uk-select uk-form-small">');
        grid.append(durationSelect);

        const durationTypes = [
            [1, 'seconds'],
            [60, 'minutes'],
            [60 * 60, 'hours', true],
            [60 * 60 * 24, 'days']
        ];

        for (const durationType of durationTypes) {

            const selected = durationType.length > 2 && durationType[2] ? ' selected' : '';
            durationSelect.appendRaw(`<option value="${durationType[0]}"${selected}>${durationType[1]}</option>`);
        }

        grid.appendRaw('<button id="save-assign-privilege" class="uk-button uk-button-default uk-button-small">Save</button>')

        return form;
    }

    function setupAssignPrivilegeForm(element: HTMLElement) {

        const query = element.getElementsByClassName('assign-privileges-form');
        if (query.length < 1) return;

        const form = query[0] as HTMLFormElement;

        const saveButton = form.querySelector('#save-assign-privilege') as HTMLElement;
        Views.onClick(saveButton, async () => {

            const userName = (form.querySelector('#user-input-assign-privilege') as HTMLInputElement).value;

            if (userName.trim().length < 1) {

                Views.showWarningNotification('User name cannot be empty!');
                return;
            }

            const valueString = (form.querySelector('#value-input-assign-privilege') as HTMLInputElement).value.trim();
            const value = parseInt(valueString);

            if ((value.toString() != valueString) || (value < ValueMin) || (value > ValueMax)) {

                Views.showWarningNotification(`Value must be between ${ValueMin} and ${ValueMax}!`);
                return;
            }

            let durationString = (form.querySelector('#duration-input-assign-privilege') as HTMLInputElement).value.trim();

            if (! durationString) {
                durationString = '0';
            }
            let duration = parseInt(durationString);

            if (duration < 0) {

                Views.showWarningNotification('Duration cannot be negative!');
                return;
            }

            let durationMultiplier = (form.querySelector('#duration-type-assign-privilege') as HTMLSelectElement).value;

            duration *= parseInt(durationMultiplier);

            let user: UserRepository.User;

            try {
                user = await UserRepository.getUserByName(userName);
            }
            catch {
                //skip
            }
            if (! user) {

                Views.showWarningNotification('Cannot find user with name: ' + userName);
                return;
            }

            const assignType = form.getAttribute('data-assign-type');
            const elementId = form.getAttribute('data-entity-id');

            try {
                switch (assignType) {

                    case 'thread-message':
                        await PrivilegesRepository.assignThreadMessagePrivilege(elementId, user.id, value, duration);
                        break;

                    case 'thread':
                        await PrivilegesRepository.assignThreadPrivilege(elementId, user.id, value, duration);
                        break;

                    case 'tag':
                        await PrivilegesRepository.assignTagPrivilege(elementId, user.id, value, duration);
                        break;

                    case 'category':
                        await PrivilegesRepository.assignCategoryPrivilege(elementId, user.id, value, duration);
                        break;

                    case 'forum-wide':
                        await PrivilegesRepository.assignForumWidePrivilege(user.id, value, duration);
                        break;
                }

                Views.showSuccessNotification('Assigned privilege will be displayed when reopening the modal.');
            }
            catch (ex) {

                Views.showDangerNotification(`Could not assign privilege: ${ex}`);
            }
        });
    }

    export function showPrivilegesAssignedToUser(user: UserRepository.User,
                                                 callback: PageActions.IPrivilegesCallback): void {

        const modal = showPrivilegesModal('Privileges Assigned To User: ' + user.name);

        Views.showModal(modal);

        const promise = callback.getPrivilegesAssignedToUser(user.id);

        if (Privileges.User.canViewPrivilegesAssignedToUser(user)) {

            showPrivilegesAssignedToUserPart(modal.getElementsByClassName('privileges-part1')[0] as HTMLElement,
                promise, false);

            showPrivilegesAssignedToUserPart(modal.getElementsByClassName('privileges-part2')[0] as HTMLElement,
                promise, true);
        }
    }

    function showPrivilegesAssignedToUserPart(toReplace: HTMLElement, promise: Promise<AssignedPrivilegesCollection>,
                                              showRevoked: boolean): void {

        toReplace.innerText = '';

        Views.changeContent(toReplace, async () => {

            const tabEntries: Views.TabEntry[] = [];

            const collection = await promise;

            const prefix = showRevoked ? 'Revoked' : 'Granted';

            function compareFn(first: AssignedPrivilege, second: AssignedPrivilege): number {

                return first.granted - second.granted;
            }

            function filterFn(assignedPrivilege: AssignedPrivilege): boolean {

                return showRevoked ? (assignedPrivilege.value < 0) : (assignedPrivilege.value >= 0);
            }

            const discussionThreadPrivileges = collection.discussionThreadPrivileges.filter(filterFn);
            discussionThreadPrivileges.sort(compareFn);

            const discussionTagPrivileges = collection.discussionTagPrivileges.filter(filterFn);
            discussionTagPrivileges.sort(compareFn);

            const discussionCategoryPrivileges = collection.discussionCategoryPrivileges.filter(filterFn);
            discussionCategoryPrivileges.sort(compareFn);

            const forumWidePrivileges = collection.forumWidePrivileges.filter(filterFn);
            forumWidePrivileges.sort(compareFn);

            if (discussionThreadPrivileges.length) {

                tabEntries.push(createAssignedPrivilegesTable(`${prefix} Thread Levels`,
                    discussionThreadPrivileges, 'Thread',
                    (assignedPrivilege) => ThreadsView.createThreadsLink({

                        id: assignedPrivilege.id,
                        name: assignedPrivilege.name
                    } as ThreadRepository.Thread)));
            }

            if (discussionTagPrivileges.length) {

                tabEntries.push(createAssignedPrivilegesTable(`${prefix} Tag Levels`,
                    discussionTagPrivileges, 'Tag',
                    (assignedPrivilege) => TagsView.createTagElement({

                        id: assignedPrivilege.id,
                        name: assignedPrivilege.name
                    } as TagRepository.Tag)));
            }

            if (discussionCategoryPrivileges.length) {

                tabEntries.push(createAssignedPrivilegesTable(`${prefix} Category Levels`,
                    discussionCategoryPrivileges, 'Category',
                    (assignedPrivilege) => CategoriesView.createCategoryLink({

                        id: assignedPrivilege.id,
                        name: assignedPrivilege.name
                    } as CategoryRepository.Category)));
            }

            if (forumWidePrivileges.length) {

                tabEntries.push(createAssignedPrivilegesTable(`${prefix} Forum Wide Levels`,
                    forumWidePrivileges, '', null));
            }

            if (0 == tabEntries.length) {

                return DOMHelpers.parseHTML(`<span class="uk-text-warning">No privileges ${showRevoked ? 'revoked' : 'assigned'}</span>`);
            }

            const result = Views.createTabs(tabEntries, 0, 'center').toElement();

            Views.setupThreadMessagesOfThreadsLinks(result);
            Views.setupThreadsWithTagsLinks(result);
            Views.setupCategoryLinks(result);

            return result;

        }, true);

    }
}