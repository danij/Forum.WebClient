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

    export function getCategoryPrivileges(): ICategoryPrivileges {

        return new CategoryPrivilegesAllowAll();
    }

    export interface ITagPrivileges {

        canAddNewTag(): Promise<boolean>;

        canDeleteTag(id: string): Promise<boolean>;

        canEditTagName(id: string): Promise<boolean>;
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
    }

    export function getTagPrivileges(): ITagPrivileges {

        return new TagPrivilegesAllowAll();
    }
}