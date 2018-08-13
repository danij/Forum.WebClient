import {CategoryRepository} from "./categoryRepository";
import {CommonEntities} from "./commonEntities";
import {TagRepository} from "./tagRepository";
import {ThreadRepository} from "./threadRepository";
import {ThreadMessageRepository} from "./threadMessageRepository";
import {UserRepository} from "./userRepository";
import {PrivilegesRepository} from "./privilegesRepository";

export module Privileges {

    function hasPrivilege(privileges: CommonEntities.PrivilegesArray, privilege: string): boolean {

        return privileges.privileges.indexOf(privilege) >= 0;
    }

    export namespace Category {

        export function canAddNewSubCategory(parent: CategoryRepository.Category): boolean {
            return ForumWide.canAddNewRootCategory();
        }

        export function canDeleteCategory(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'delete');
        }

        export function canEditCategoryName(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'change_name');
        }

        export function canEditCategoryDescription(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'change_description');
        }

        export function canEditCategoryDisplayOrder(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'change_displayorder');
        }

        export function canEditCategoryParent(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'change_parent');
        }

        export function canEditCategoryTags(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'add_tag') || hasPrivilege(category, 'remove_tag');
        }

        export function canViewCategoryRequiredPrivileges(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'view_required_privileges');
        }

        export function canViewCategoryAssignedPrivileges(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, 'view_assigned_privileges');
        }
    }

    export namespace Tag {

        export function canDeleteTag(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, 'delete');
        }

        export function canEditTagName(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, 'change_name');
        }

        export function canMergeTags(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, 'merge');
        }

        export function canViewTagRequiredPrivileges(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, 'view_required_privileges');
        }

        export function canViewTagAssignedPrivileges(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, 'view_assigned_privileges');
        }
    }

    export namespace Thread {

        export function canDeleteThread(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'delete');
        }

        export function canEditThreadName(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'change_name');
        }

        export function canEditThreadPinDisplayOrder(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'change_pin_display_order');
        }

        export function canEditThreadTags(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'add_tag') || hasPrivilege(thread, 'remove_tag');
        }

        export function canMergeThreads(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'merge');
        }

        export function canAddNewThreadMessage(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'add_message');
        }

        export function canViewThreadRequiredPrivileges(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'view_required_privileges');
        }

        export function canViewThreadAssignedPrivileges(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, 'view_assigned_privileges');
        }
    }

    export namespace ThreadMessage {

        export function canEditThreadMessageContent(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'change_content');
        }

        export function canMoveThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'move');
        }

        export function canDeleteThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'delete');
        }

        export function canCommentThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'add_comment');
        }

        export function canSolveThreadMessageComment(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'set_comment_to_solved');
        }

        export function canUpVoteThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'up_vote');
        }

        export function canDownVoteThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'down_vote');
        }

        export function canResetVoteOfThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'reset_vote');
        }

        export function canViewThreadMessageRequiredPrivileges(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'view_required_privileges');
        }

        export function canViewThreadMessageAssignedPrivileges(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, 'view_assigned_privileges');
        }
    }

    export namespace User {

        const currentUserId = '00000000-0000-0000-0000-000000000000';

        function checkForumWideUserPrivilege(user: UserRepository.User, whenCurrentUser: string, whenDifferentUser: string) {

            return hasPrivilege(ForumWide.currentUserPrivileges(), user.id == currentUserId
                ? whenCurrentUser
                : whenDifferentUser);
        }

        export function canEditUserName(user: UserRepository.User): boolean {
            return checkForumWideUserPrivilege(user, 'change_own_user_name', 'change_any_user_name');
        }

        export function canEditUserInfo(user: UserRepository.User): boolean {
            return checkForumWideUserPrivilege(user, 'change_own_user_info', 'change_any_user_info');
        }

        export function canEditUserTitle(user: UserRepository.User): boolean {
            return checkForumWideUserPrivilege(user, 'change_own_user_title', 'change_any_user_title');
        }

        export function canEditUserSignature(user: UserRepository.User): boolean {
            return checkForumWideUserPrivilege(user, 'change_own_user_signature', 'change_any_user_signature');
        }

        export function canEditUserLogo(user: UserRepository.User): boolean {
            return checkForumWideUserPrivilege(user, 'change_own_user_logo', 'change_any_user_logo');
        }

        export function canDeleteUser(user: UserRepository.User): boolean {
            return checkForumWideUserPrivilege(user, 'delete_own_user_logo', 'delete_any_user_logo');
        }

        export function canViewUserComments(user: UserRepository.User): boolean {
            return hasPrivilege(ForumWide.currentUserPrivileges(), 'get_message_comments_of_user');
        }

        export function canViewPrivilegesAssignedToUser(user: UserRepository.User): boolean {
            return hasPrivilege(ForumWide.currentUserPrivileges(), 'view_user_assigned_privileges');
        }
    }

    export namespace ForumWide {

        let forumWidePrivilegesOfCurrentUser: CommonEntities.PrivilegesArray;

        export function currentUserPrivileges(): CommonEntities.PrivilegesArray {

            return forumWidePrivilegesOfCurrentUser;
        }

        export function canViewAllComments(): boolean {
            return hasPrivilege(forumWidePrivilegesOfCurrentUser, 'get_all_message_comments');
        }

        export function canViewForumWideRequiredPrivileges(): boolean {
            return hasPrivilege(forumWidePrivilegesOfCurrentUser, 'view_forum_wide_required_privileges');
        }

        export function canViewForumWideAssignedPrivileges(): boolean {
            return hasPrivilege(forumWidePrivilegesOfCurrentUser, 'view_forum_wide_assigned_privileges');
        }

        export function canAddNewRootCategory(): boolean {
            return hasPrivilege(forumWidePrivilegesOfCurrentUser, 'add_discussion_category');
        }

        export function canAddNewTag(): boolean {
            return hasPrivilege(forumWidePrivilegesOfCurrentUser, 'add_discussion_tag');
        }

        export function canAddNewThread(): boolean {
            return hasPrivilege(forumWidePrivilegesOfCurrentUser, 'add_discussion_thread');
        }

        export async function loadForumWidePrivileges(): Promise<void> {

            forumWidePrivilegesOfCurrentUser = await PrivilegesRepository.getForumWidePrivilegesOfCurrentUser();
        }
    }
}