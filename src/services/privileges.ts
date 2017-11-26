export module Privileges {

    export interface ICategoryPrivileges {

        canAddNewRootCategory(): Promise<boolean>;

        canAddNewSubCategory(parentId: string): Promise<boolean>;

        canDeleteCategory(id: string): Promise<boolean>;

        canEditCategoryName(id: string): Promise<boolean>;

        canEditCategoryDescription(id: string): Promise<boolean>;

        canEditCategoryDisplayOrder(id: string): Promise<boolean>;

        canEditCategoryParent(id: string): Promise<boolean>;
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
    }

    export function getCategoryPrivileges(): ICategoryPrivileges {

        return new CategoryPrivilegesAllowAll();
    }
}