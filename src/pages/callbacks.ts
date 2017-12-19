import {PageActions} from "./action";
import {TagRepository} from "../services/tagRepository";

export module Callbacks {

    class CategoryCallback implements PageActions.ICategoryCallback {

        createRootCategory(name: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        createSubCategory(parentId: string, name: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteCategory(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editCategoryName(id: string, newName: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editCategoryDescription(id: string, newDescription: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editCategoryDisplayOrder(id: string, newDisplayOrder: number): Promise<boolean> {

            return Promise.resolve(true);
        }

        editCategoryParent(id: string, newParentId: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editCategoryTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean> {

            return Promise.resolve(true);
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class TagCallback implements PageActions.ITagCallback {

        createRootTag(name: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteTag(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editTagName(id: string, newName: string): Promise<boolean> {

            return Promise.resolve(true);
        }
    }

    export function getCategoryCallback() : PageActions.ICategoryCallback {

        return new CategoryCallback();
    }

    export function getTagCallback() : PageActions.ITagCallback {

        return new TagCallback();
    }
}