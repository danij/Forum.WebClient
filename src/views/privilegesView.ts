import {Views} from "./common";
import {PageActions} from "../pages/action";
import {DOMHelpers} from "../helpers/domHelpers";
import {PrivilegesRepository} from "../services/privilegesRepository";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {ThreadRepository} from "../services/threadRepository";
import {TagRepository} from "../services/tagRepository";
import {CategoryRepository} from "../services/categoryRepository";

export module PrivilegesView {

    import DOMAppender = DOMHelpers.DOMAppender;
    import RequiredPrivilegesCollection = PrivilegesRepository.RequiredPrivilegesCollection;
    import TabEntry = Views.TabEntry;

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

    export function showThreadMessagePrivileges(message: ThreadMessageRepository.ThreadMessage,
                                                callback: PageActions.IPrivilegesCallback): void {

        let modal = document.getElementById('privileges-modal');

        Views.showModal(modal);

        const threadMessageRequiredPrivilegesPromises = [

            callback.getThreadMessageRequiredPrivileges(message.id),
            callback.getThreadRequiredPrivileges(message.parentThread.id)
        ];
        for (let tag of message.parentThread.tags) {

            threadMessageRequiredPrivilegesPromises.push(callback.getTagRequiredPrivileges(tag.id));
        }
        threadMessageRequiredPrivilegesPromises.push(callback.getForumWideRequiredPrivileges());

        showRequiredPrivileges(modal, Promise.all(threadMessageRequiredPrivilegesPromises));
    }

    export function showThreadPrivileges(thread: ThreadRepository.Thread,
                                         callback: PageActions.IPrivilegesCallback): void {

        let modal = document.getElementById('privileges-modal');

        Views.showModal(modal);

        const requiredPrivilegesPromises = [

            callback.getThreadRequiredPrivileges(thread.id)
        ];
        for (let tag of thread.tags) {

            requiredPrivilegesPromises.push(callback.getTagRequiredPrivileges(tag.id));
        }
        requiredPrivilegesPromises.push(callback.getForumWideRequiredPrivileges());

        showRequiredPrivileges(modal, Promise.all(requiredPrivilegesPromises), Promise.all(requiredPrivilegesPromises));
    }

    export function showTagPrivileges(tag: TagRepository.Tag, callback: PageActions.IPrivilegesCallback): void {

        let modal = document.getElementById('privileges-modal');

        Views.showModal(modal);

        const requiredPrivilegesPromises = [

            callback.getTagRequiredPrivileges(tag.id),
            callback.getForumWideRequiredPrivileges()
        ];

        showRequiredPrivileges(modal, Promise.all(requiredPrivilegesPromises), Promise.all(requiredPrivilegesPromises),
            Promise.all(requiredPrivilegesPromises));
    }

    export function showCategoryPrivileges(category: CategoryRepository.Category,
                                           callback: PageActions.IPrivilegesCallback): void {

        let modal = document.getElementById('privileges-modal');

        Views.showModal(modal);

        const requiredPrivilegesPromises = [

            callback.getCategoryRequiredPrivileges(category.id),
            callback.getForumWideRequiredPrivileges()
        ];

        showRequiredPrivileges(modal, null, null, null,
            Promise.all(requiredPrivilegesPromises));
    }

    export function showForumWidePrivileges(callback: PageActions.IPrivilegesCallback): void {

        let modal = document.getElementById('privileges-modal');

        Views.showModal(modal);

        const requiredPrivilegesPromises = [

            callback.getForumWideRequiredPrivileges()
        ];

        let promise = Promise.all(requiredPrivilegesPromises);

        showRequiredPrivileges(modal, promise, promise, promise, promise, promise);
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

                tabEntries.push(appendRequiredPrivileges('Thread Message Required Levels',
                    ThreadMessagePrivilegeNames, await threadMessageRequiredPrivileges,
                    'discussionThreadMessagePrivileges'));
            }
            if (threadRequiredPrivileges) {

                tabEntries.push(appendRequiredPrivileges('Thread Required Levels',
                    ThreadPrivilegeNames, await threadRequiredPrivileges,
                    'discussionThreadPrivileges'));
            }
            if (tagRequiredPrivileges) {

                tabEntries.push(appendRequiredPrivileges('Tag Required Levels',
                    TagPrivilegeNames, await tagRequiredPrivileges,
                    'discussionTagPrivileges'));
            }
            if (categoryRequiredPrivileges) {

                tabEntries.push(appendRequiredPrivileges('Category Required Levels',
                    CategoryPrivilegeNames, await categoryRequiredPrivileges,
                    'discussionCategoryPrivileges'));
            }
            if (forumWideRequiredPrivileges) {

                tabEntries.push(appendRequiredPrivileges('Forum Wide Required Levels',
                    ForumWidePrivilegeNames, await forumWideRequiredPrivileges,
                    'forumWidePrivileges'));
            }

            const result = Views.createTabs(tabEntries, 0, 'center');

            return result;

        }, false);
    }

    function appendRequiredPrivileges(title: string, privilegeNames,
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
}