import {CategoryRepository} from "./categoryRepository";
import {CommonEntities} from "./commonEntities";
import {TagRepository} from "./tagRepository";
import {ThreadRepository} from "./threadRepository";
import {ThreadMessageRepository} from "./threadMessageRepository";
import {UserRepository} from "./userRepository";

export module Privileges {

    function hasPrivilege(privileges: CommonEntities.PrivilegesArray, privilege: string): boolean {

        return true; //TODO add actual search
    }

    export namespace Category {

        export function canAddNewSubCategory(parent: CategoryRepository.Category): boolean {
            return hasPrivilege(parent, "TODO");
        }

        export function canDeleteCategory(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canEditCategoryName(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canEditCategoryDescription(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canEditCategoryDisplayOrder(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canEditCategoryParent(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canEditCategoryTags(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canViewCategoryRequiredPrivileges(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }

        export function canViewCategoryAssignedPrivileges(category: CategoryRepository.Category): boolean {
            return hasPrivilege(category, "TODO");
        }
    }

    export namespace Tag {

        export function canDeleteTag(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, "TODO");
        }

        export function canEditTagName(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, "TODO");
        }

        export function canMergeTags(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, "TODO");
        }

        export function canViewTagRequiredPrivileges(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, "TODO");
        }

        export function canViewTagAssignedPrivileges(tag: TagRepository.Tag): boolean {
            return hasPrivilege(tag, "TODO");
        }
    }

    export namespace Thread {

        export function canDeleteThread(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canEditThreadName(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canEditThreadPinDisplayOrder(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canEditThreadTags(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canMergeThreads(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canAddNewThreadMessage(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canViewThreadRequiredPrivileges(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }

        export function canViewThreadAssignedPrivileges(thread: ThreadRepository.Thread): boolean {
            return hasPrivilege(thread, "TODO");
        }
    }

    export namespace ThreadMessage {

        export function canEditThreadMessageContent(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canMoveThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canDeleteThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canCommentThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canSolveThreadMessageComment(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canUpVoteThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canDownVoteThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canResetVoteOfThreadMessage(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canViewThreadMessageRequiredPrivileges(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }

        export function canViewThreadMessageAssignedPrivileges(message: ThreadMessageRepository.ThreadMessage): boolean {
            return hasPrivilege(message, "TODO");
        }
    }

    export namespace User {

        export function canEditUserName(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canEditUserInfo(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canEditUserTitle(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canEditUserSignature(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canEditUserLogo(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canDeleteUser(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canViewUserComments(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }

        export function canViewPrivilegesAssignedToUser(user: UserRepository.User): boolean {
            return hasPrivilege(user, "TODO");
        }
    }

    export namespace ForumWide {

        export function canViewAllComments(): boolean {
            return true;
        }

        export function canViewForumWideRequiredPrivileges(): boolean {
            return true;
        }

        export function canViewForumWideAssignedPrivileges(): boolean {
            return true;
        }

        export function canAddNewRootCategory(): boolean {
            return true;
        }

        export function canAddNewTag(): boolean {
            return true;
        }

        export function canAddNewThread(): boolean {
            return true;
        }
    }
}