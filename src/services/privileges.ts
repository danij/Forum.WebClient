export module Privileges {

    export interface ICategoryPrivileges {

        canAddNewRootCategory(): Promise<boolean>;

        canAddNewSubCategory(parentId: string): Promise<boolean>;

        canDeleteCategory(id: string): Promise<boolean>;

        canEditCategoryName(id: string): Promise<boolean>;

        canEditCategoryDescription(id: string): Promise<boolean>;

        canEditCategoryDisplayOrder(id: string): Promise<boolean>;

        canEditCategoryParent(id: string): Promise<boolean>;

        canEditCategoryTags(id: string): Promise<boolean>;

        canViewCategoryRequiredPrivileges(id: string): Promise<boolean>;

        canViewCategoryAssignedPrivileges(id: string): Promise<boolean>;
    }

    class CategoryPrivilegesAllowAll implements ICategoryPrivileges {

        canAddNewRootCategory(): Promise<boolean> {
            return Promise.resolve(true);
        }

        canAddNewSubCategory(): Promise<boolean> {
            return Promise.resolve(true);
        }

        canDeleteCategory(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canEditCategoryName(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canEditCategoryDescription(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canEditCategoryDisplayOrder(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canEditCategoryParent(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canEditCategoryTags(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canViewCategoryRequiredPrivileges(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canViewCategoryAssignedPrivileges(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }
    }

    export interface ITagPrivileges {

        canAddNewTag(): Promise<boolean>;

        canDeleteTag(id: string): Promise<boolean>;

        canEditTagName(id: string): Promise<boolean>;

        canMergeTags(id: string): Promise<boolean>;

        canViewTagRequiredPrivileges(id: string): Promise<boolean>;

        canViewTagAssignedPrivileges(id: string): Promise<boolean>;
    }

    class TagPrivilegesAllowAll implements ITagPrivileges {

        canAddNewTag(): Promise<boolean> {
            return Promise.resolve(true);
        }

        canDeleteTag(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canEditTagName(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canMergeTags(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canViewTagRequiredPrivileges(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }

        canViewTagAssignedPrivileges(id: string): Promise<boolean> {
            return Promise.resolve(true);
        }
    }

    export interface IThreadPrivileges {

        canAddNewThread(): Promise<boolean>;

        canDeleteThread(id: string): Promise<boolean>;

        canEditThreadName(id: string): Promise<boolean>;

        canEditThreadPinDisplayOrder(id: string): Promise<boolean>;

        canEditThreadTags(id: string): Promise<boolean>;

        canMergeThreads(id: string): Promise<boolean>;

        canAddNewThreadMessage(id: string): Promise<boolean>;

        canViewThreadRequiredPrivileges(id: string): Promise<boolean>;

        canViewThreadAssignedPrivileges(id: string): Promise<boolean>;
    }

    class ThreadPrivilegesAllowAll implements IThreadPrivileges {

        canAddNewThread(): Promise<boolean> {

            return Promise.resolve(true);
        }

        canDeleteThread(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditThreadName(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditThreadPinDisplayOrder(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditThreadTags(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canMergeThreads(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canAddNewThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewThreadRequiredPrivileges(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewThreadAssignedPrivileges(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

    }

    export interface IThreadMessagePrivileges {

        canEditThreadMessageContent(id: string): Promise<boolean>;

        canMoveThreadMessage(id: string): Promise<boolean>;

        canDeleteThreadMessage(id: string): Promise<boolean>;

        canCommentThreadMessage(id: string): Promise<boolean>;

        canSolveThreadMessageComment(id: string): Promise<boolean>;

        canUpVoteThreadMessage(id: string): Promise<boolean>;

        canDownVoteThreadMessage(id: string): Promise<boolean>;

        canResetVoteOfThreadMessage(id: string): Promise<boolean>;

        canViewThreadMessageRequiredPrivileges(id: string): Promise<boolean>;

        canViewThreadMessageAssignedPrivileges(id: string): Promise<boolean>;
    }

    class ThreadMessagePrivilegesAllowAll implements IThreadMessagePrivileges {

        canEditThreadMessageContent(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canMoveThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canDeleteThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canCommentThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canSolveThreadMessageComment(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canUpVoteThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canDownVoteThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canResetVoteOfThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewThreadMessageRequiredPrivileges(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewThreadMessageAssignedPrivileges(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }
    }

    export interface IUserPrivileges {

        canEditUserName(id: string): Promise<boolean>;

        canEditUserInfo(id: string): Promise<boolean>;

        canEditUserTitle(id: string): Promise<boolean>;

        canEditUserSignature(id: string): Promise<boolean>;

        canEditUserLogo(id: string): Promise<boolean>;

        canDeleteUser(id: string): Promise<boolean>;

        canViewUserComments(id: string): Promise<boolean>;

        canViewPrivilegesAssignedToUser(id: string): Promise<boolean>;
    }

    class UserPrivilegesAllowAll implements IUserPrivileges {

        canEditUserName(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditUserInfo(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditUserTitle(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditUserSignature(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canEditUserLogo(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canDeleteUser(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewUserComments(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewPrivilegesAssignedToUser(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }
    }

    export interface IForumWidePrivileges {

        canViewAllComments(): Promise<boolean>;

        canViewForumWideRequiredPrivileges(): Promise<boolean>;

        canViewForumWideAssignedPrivileges(): Promise<boolean>;
    }

    class ForumWidePrivilegesAllowAll implements IForumWidePrivileges {

        canViewAllComments(): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewForumWideRequiredPrivileges(): Promise<boolean> {

            return Promise.resolve(true);
        }

        canViewForumWideAssignedPrivileges(): Promise<boolean> {

            return Promise.resolve(true);
        }
    }

    export function getCategoryPrivileges(): ICategoryPrivileges {

        return new CategoryPrivilegesAllowAll();
    }

    export function getTagPrivileges(): ITagPrivileges {

        return new TagPrivilegesAllowAll();
    }

    export function getThreadPrivileges(): IThreadPrivileges {

        return new ThreadPrivilegesAllowAll();
    }

    export function getThreadMessagePrivileges(): IThreadMessagePrivileges {

        return new ThreadMessagePrivilegesAllowAll();
    }

    export function getUserPrivileges(): IUserPrivileges {

        return new UserPrivilegesAllowAll();
    }

    export function getForumWidePrivileges(): IForumWidePrivileges {

        return new ForumWidePrivilegesAllowAll();
    }
}