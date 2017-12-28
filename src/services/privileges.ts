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

    export class CategoryPrivilegesAllowAll implements ICategoryPrivileges {

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

    export class TagPrivilegesAllowAll implements ITagPrivileges {

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
    }

    export class ThreadPrivilegesAllowAll implements IThreadPrivileges {

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
}