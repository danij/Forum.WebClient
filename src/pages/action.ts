import {TagRepository} from "../services/tagRepository";
import {ThreadRepository} from "../services/threadRepository";
import {UserRepository} from "../services/userRepository";
import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {CategoryRepository} from "../services/categoryRepository";
import {Pages} from "./common";

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

        createTag(name: string): Promise<boolean>;

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

        getSubscribedUsers(id: string): Promise<UserRepository.User[]>;

        addThreadMessage(id: string, content: string): Promise<string>;

        getAllTags(): Promise<TagRepository.Tag[]>;
    }

    export interface IThreadMessageCallback {

        editThreadMessageContent(id: string, newContent: string): Promise<boolean>;

        moveThreadMessage(id: string, targetThreadId: string): Promise<boolean>;

        deleteThreadMessage(id: string): Promise<boolean>;

        commentThreadMessage(id: string, comment: string): Promise<boolean>;

        getCommentsOfThreadMssage(id: string): Promise<ThreadMessageRepository.ThreadMessageComment[]>;

        solveThreadMessageComment(id: string): Promise<boolean>;
    }

    export interface IUserCallback {

        editUserName(id: string, newName: string): Promise<boolean>;

        editUserTitle(id: string, newTitle: string): Promise<boolean>;

        editUserSignature(id: string, newSignature: string): Promise<boolean>;

        deleteUserLogo(id: string): Promise<boolean>;

        uploadUserLogo(id: string): Promise<boolean>;

        deleteUser(id: string): Promise<boolean>;
    }

    class CategoryCallback implements ICategoryCallback {

        async createRootCategory(name: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.addNewCategory(name));
        }

        async createSubCategory(parentId: string, name: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.addNewCategory(name, parentId));
        }

        async deleteCategory(id: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.deleteCategory(id));
        }

        async editCategoryName(id: string, newName: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryName(id, newName));
        }

        async editCategoryDescription(id: string, newDescription: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryDescription(id, newDescription));
        }

        async editCategoryDisplayOrder(id: string, newDisplayOrder: number): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryDisplayOrder(id, newDisplayOrder));
        }

        async editCategoryParent(id: string, newParentId: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryParent(id, newParentId));
        }

        async editCategoryTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(Promise.all(
                (addTagIds || []).map((tagId) => CategoryRepository.addTagToCategory(id, tagId))
                    .concat((removeTagIds || []).map((tagId) => CategoryRepository.removeTagFromCategory(id, tagId)))
            ));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class TagCallback implements ITagCallback {

        async createTag(name: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(TagRepository.addNewTag(name));
        }

        async deleteTag(id: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(TagRepository.deleteTag(id));
        }

        async editTagName(id: string, newName: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(TagRepository.editTagName(id, newName));
        }

        async mergeTags(sourceId: string, destinationId: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(TagRepository.mergeTags(sourceId, destinationId));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class ThreadCallback implements IThreadCallback {

        createThread(name: string, content: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        async deleteThread(id: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(ThreadRepository.deleteThread(id));
        }

        async editThreadName(id: string, newName: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(ThreadRepository.editThreadName(id, newName));
        }

        async editThreadPinDisplayOrder(id: string, newPinDisplayOrder: number): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(ThreadRepository.editThreadPinDisplayOrder(id, newPinDisplayOrder));
        }

        async editThreadTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(Promise.all(
                (addTagIds || []).map((tagId) => ThreadRepository.addTagToThread(id, tagId))
                    .concat((removeTagIds || []).map((tagId) => ThreadRepository.removeTagFromThread(id, tagId)))
            ));
        }

        async subscribeToThread(id: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(ThreadRepository.subscribeToThread(id));
        }

        async unSubscribeFromThread(id: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(ThreadRepository.unSubscribeFromThread(id));
        }

        async mergeThreads(sourceId: string, destinationId: string): Promise<boolean> {

            return await Pages.trueOrShowErrorAndFalse(ThreadRepository.mergeThreads(sourceId, destinationId));
        }

        async searchThreadsByName(name: string): Promise<ThreadRepository.Thread[]> {

            try {

                return await ThreadRepository.searchThreadsByName(name);
            }
            catch {
                return [];
            }
        }

        getSubscribedUsers(id: string): Promise<UserRepository.User[]> {

            return UserRepository.getUsersSubscribedToThread(id);
        }

        async addThreadMessage(id: string, content: string): Promise<string> {

            return await Pages.getOrShowError(ThreadMessageRepository.addThreadMessage(id, content.trim()));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class ThreadMessageCallback implements IThreadMessageCallback {

        editThreadMessageContent(id: string, newContent: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        moveThreadMessage(id: string, targetThreadId: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteThreadMessage(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        commentThreadMessage(id: string, comment: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        solveThreadMessageComment(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        async getCommentsOfThreadMssage(id: string): Promise<ThreadMessageRepository.ThreadMessageComment[]> {

            return (await ThreadMessageRepository.getThreadMessageComments(id)).message_comments;
        }
    }

    class UserCallback implements IUserCallback {

        editUserName(id: string, newName: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editUserTitle(id: string, newTitle: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        editUserSignature(id: string, newSignature: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteUserLogo(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        uploadUserLogo(id: string): Promise<boolean> {

            return Promise.resolve(true);
        }

        deleteUser(id: string): Promise<boolean> {

            return Promise.resolve(true);
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

    export function getThreadMessageCallback(): IThreadMessageCallback {

        return new ThreadMessageCallback();
    }

    export function getUserCallback(): IUserCallback {

        return new UserCallback();
    }
}