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

    function showRequiredPrivileges(modal: HTMLElement,
                                    threadMessageRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    threadRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    tagRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>,
                                    categoryRequiredPrivileges?: Promise<RequiredPrivilegesCollection[]>): void {

        let toReplace = modal.getElementsByClassName('required-privileges')[0] as HTMLElement;
        toReplace.innerText = '';

        Views.changeContent(toReplace, async () => {

            let appender = new DOMAppender('<div>', '</div>');

            if (threadMessageRequiredPrivileges) {

                appendRequiredPrivileges(appender, 'Discussion Thread Message Required Levels',
                    ThreadMessagePrivilegeNames, await threadMessageRequiredPrivileges,
                    'discussionThreadMessagePrivileges');
            }
            if (threadRequiredPrivileges) {

                appendRequiredPrivileges(appender, 'Discussion Thread Required Levels',
                    ThreadPrivilegeNames, await threadRequiredPrivileges,
                    'discussionThreadPrivileges');
            }
            if (tagRequiredPrivileges) {

                appendRequiredPrivileges(appender, 'Discussion Tag Required Levels',
                    TagPrivilegeNames, await tagRequiredPrivileges,
                    'discussionTagPrivileges');
            }
            if (categoryRequiredPrivileges) {

                appendRequiredPrivileges(appender, 'Discussion Category Required Levels',
                    CategoryPrivilegeNames, await categoryRequiredPrivileges,
                    'discussionCategoryPrivileges');
            }

            let result = appender.toElement();

            return result;

        }, false);
    }

    function appendRequiredPrivileges(appender: DOMAppender, title: string, privilegeNames,
                                      values: RequiredPrivilegesCollection[], property: string): void {


        let titleAppender = new DOMAppender('<h3>', '</h3>');
        appender.append(titleAppender);
        titleAppender.appendString(title);

        let tableAppender = new DOMAppender('<table class="uk-column-divider uk-table uk-table-divier uk-table-small uk-table-striped">', '</table>');
        appender.append(tableAppender);

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
    }
}