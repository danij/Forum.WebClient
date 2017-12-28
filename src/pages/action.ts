import {TagRepository} from "../services/tagRepository";
import {ThreadRepository} from "../services/threadRepository";

export module PageActions {

    export interface ICategoryCallback {

        createRootCategory(name: string): Promise<boolean>;

        createSubCategory(parentId: string, name: string): Promise<boolean>;

        deleteCategory(id: string): Promise<boolean>;

        editCategoryName(id: string, newName: string): Promise<boolean>;

        editCategoryDescription(id: string, newDescription: string): Promise<boolean>;

        editCategoryDisplayOrder(id: string, newDisplayOrder: number): Promise<boolean>;

        editCategoryParent(id: string, newParentId: string): Promise<boolean>;

        editCategoryTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean>;

        getAllTags(): Promise<TagRepository.Tag[]>;
    }

    export interface ITagCallback {

        createRootTag(name: string): Promise<boolean>;

        deleteTag(id: string): Promise<boolean>;

        editTagName(id: string, newName: string): Promise<boolean>;

        mergeTags(sourceId: string, destinationId: string): Promise<boolean>;

        getAllTags(): Promise<TagRepository.Tag[]>;
    }

    export interface IThreadCallback {

        createThread(name: string, content: string): Promise<boolean>;

        deleteThread(id: string): Promise<boolean>;

        editThreadName(id: string, newName: string): Promise<boolean>;

        editThreadPinDisplayOrder(id: string, pinDisplayOrder: number): Promise<boolean>;

        editThreadTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean>;

        subscribeToThread(id: string): Promise<boolean>;

        unSubscribeFromThread(id: string): Promise<boolean>;

        mergeThreads(sourceId: string, destinationId: string): Promise<boolean>;

        searchThreadsByName(name: string): Promise<ThreadRepository.Thread[]>;

        getAllTags(): Promise<TagRepository.Tag[]>;
    }

    class CategoryCallback implements ICategoryCallback {

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

    class TagCallback implements ITagCallback {

        createRootTag(name: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteTag(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editTagName(id: string, newName: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        mergeTags(sourceId: string, destinationId: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class ThreadCallback implements IThreadCallback {

        createThread(name: string, content: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteThread(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editThreadName(id: string, newName: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editThreadPinDisplayOrder(id: string, pinDisplayOrder: number): Promise<boolean> {

            return Promise.resolve(true);
        }

        editThreadTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean> {

            return Promise.resolve(true);
        }

        subscribeToThread(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        unSubscribeFromThread(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        mergeThreads(sourceId: string, destinationId: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        async searchThreadsByName(name: string): Promise<ThreadRepository.Thread[]> {

            try {

                return await ThreadRepository.searchThreadsByName(name);
            }
            catch {
                return [];
            }
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    export function getCategoryCallback(): ICategoryCallback {

        return new CategoryCallback();
    }

    export function getTagCallback(): ITagCallback {

        return new TagCallback();
    }

    export function getThreadCallback(): IThreadCallback {

        return new ThreadCallback();
    }
}