import {TagRepository} from "../services/tagRepository";
import {ThreadRepository} from "../services/threadRepository";
import {UserRepository} from "../services/userRepository";
import {ThreadMessageRepository} from "../services/threadMessageRepository";

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

        getSubscribedUsers(id: string): Promise<UserRepository.User[]>;

        getAllTags(): Promise<TagRepository.Tag[]>;
    }

    export interface IThreadMessageCallback {

        editThreadMessageContent(id: string): Promise<boolean>;

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

        getSubscribedUsers(id: string): Promise<UserRepository.User[]> {

            return UserRepository.getUsersSubscribedToThread(id);
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class ThreadMessageCallback implements IThreadMessageCallback {

        editThreadMessageContent(id: string): Promise<boolean> {

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