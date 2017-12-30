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
    }

    export interface ITagPrivileges {

        canAddNewTag(): Promise<boolean>;

        canDeleteTag(id: string): Promise<boolean>;

        canEditTagName(id: string): Promise<boolean>;

        canMergeTags(id: string): Promise<boolean>;
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
    }

    export interface IThreadPrivileges {

        canAddNewThread(): Promise<boolean>;

        canDeleteThread(id: string): Promise<boolean>;

        canEditThreadName(id: string): Promise<boolean>;

        canEditThreadPinDisplayOrder(id: string): Promise<boolean>;

        canEditThreadTags(id: string): Promise<boolean>;

        canMergeThreads(id: string): Promise<boolean>;

        canAddNewThreadMessage(id: string): Promise<boolean>;
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
    }

    export interface IThreadMessagePrivileges {

        canEditThreadMessageContent(id: string): Promise<boolean>;

        canMoveThreadMessage(id: string): Promise<boolean>;

        canDeleteThreadMessage(id: string): Promise<boolean>;

        canCommentThreadMessage(id: string): Promise<boolean>;

        canSolveThreadMessageComment(id: string): Promise<boolean>;
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
    }

    export interface IUserPrivileges {

        canEditUserName(id: string): Promise<boolean>;

        canEditUserInfo(id: string): Promise<boolean>;

        canEditUserTitle(id: string): Promise<boolean>;

        canEditUserSignature(id: string): Promise<boolean>;

        canEditUserLogo(id: string): Promise<boolean>;

        canDeleteUser(id: string): Promise<boolean>;
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
}