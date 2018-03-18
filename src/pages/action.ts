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

        createThread(name: string, tagIds: string[], content: string): Promise<string>;

        deleteThread(id: string): Promise<boolean>;

        editThreadName(id: string, newName: string): Promise<boolean>;

        editThreadPinDisplayOrder(id: string, pinDisplayOrder: number): Promise<boolean>;

        editThreadTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean>;

        subscribeToThread(id: string): Promise<boolean>;

        unSubscribeFromThread(id: string): Promise<boolean>;

        mergeThreads(sourceId: string, destinationId: string): Promise<boolean>;

        searchThreadsByInitial(name: string): Promise<ThreadRepository.Thread[]>;

        searchThreadsByName(name: string): Promise<ThreadRepository.Thread[]>;

        getSubscribedUsers(id: string): Promise<UserRepository.User[]>;

        addThreadMessage(id: string, content: string): Promise<string>;

        getAllTags(): Promise<TagRepository.Tag[]>;
    }

    export interface IThreadMessageCallback {

        editThreadMessageContent(id: string, newContent: string, changeReason: string): Promise<boolean>;

        moveThreadMessage(id: string, targetThreadId: string): Promise<boolean>;

        deleteThreadMessage(id: string): Promise<boolean>;

        commentThreadMessage(id: string, comment: string): Promise<boolean>;

        getCommentsOfThreadMessage(id: string): Promise<ThreadMessageRepository.ThreadMessageComment[]>;

        solveThreadMessageComment(id: string): Promise<boolean>;

        searchThreadMessagesByName(name: string): Promise<ThreadMessageRepository.ThreadMessageCollection>;

        upVote(id: string): Promise<boolean>;

        downVote(id: string): Promise<boolean>;

        resetVote(id: string): Promise<boolean>;
    }

    export interface IUserCallback {

        editUserName(id: string, newName: string): Promise<boolean>;

        editUserInfo(id: string, newTitle: string): Promise<boolean>;

        editUserTitle(id: string, newTitle: string): Promise<boolean>;

        editUserSignature(id: string, newSignature: string): Promise<boolean>;

        deleteUserLogo(id: string): Promise<boolean>;

        uploadUserLogo(id: string, fileContent: ArrayBuffer): Promise<boolean>;

        deleteUser(id: string): Promise<boolean>;

        searchUsersByName(name: string): Promise<UserRepository.User[]>;
    }

    class CategoryCallback implements ICategoryCallback {

        createRootCategory(name: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.addNewCategory(name));
        }

        createSubCategory(parentId: string, name: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.addNewCategory(name, parentId));
        }

        deleteCategory(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.deleteCategory(id));
        }

        editCategoryName(id: string, newName: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryName(id, newName));
        }

        editCategoryDescription(id: string, newDescription: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryDescription(id, newDescription));
        }

        editCategoryDisplayOrder(id: string, newDisplayOrder: number): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryDisplayOrder(id, newDisplayOrder));
        }

        editCategoryParent(id: string, newParentId: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(CategoryRepository.editCategoryParent(id, newParentId));
        }

        editCategoryTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(Promise.all(
                (addTagIds || []).map((tagId) => CategoryRepository.addTagToCategory(id, tagId))
                    .concat((removeTagIds || []).map((tagId) => CategoryRepository.removeTagFromCategory(id, tagId)))
            ));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class TagCallback implements ITagCallback {

        createTag(name: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(TagRepository.addNewTag(name));
        }

        deleteTag(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(TagRepository.deleteTag(id));
        }

        editTagName(id: string, newName: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(TagRepository.editTagName(id, newName));
        }

        mergeTags(sourceId: string, destinationId: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(TagRepository.mergeTags(sourceId, destinationId));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class ThreadCallback implements IThreadCallback {

        async createThread(name: string, tagIds: string[], content: string): Promise<string> {

            let result = await Pages.getOrShowError(ThreadRepository.createThread(name));

            await Pages.trueOrShowErrorAndFalse(this.editThreadTags(result, tagIds, null));

            await Pages.trueOrShowErrorAndFalse(this.addThreadMessage(result, content));

            return result;
        }

        deleteThread(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.deleteThread(id));
        }

        editThreadName(id: string, newName: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.editThreadName(id, newName));
        }

        editThreadPinDisplayOrder(id: string, newPinDisplayOrder: number): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.editThreadPinDisplayOrder(id, newPinDisplayOrder));
        }

        editThreadTags(id: string, addTagIds: string[], removeTagIds: string[]): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(Promise.all(
                (addTagIds || []).map((tagId) => ThreadRepository.addTagToThread(id, tagId))
                    .concat((removeTagIds || []).map((tagId) => ThreadRepository.removeTagFromThread(id, tagId)))
            ));
        }

        subscribeToThread(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.subscribeToThread(id));
        }

        unSubscribeFromThread(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.unSubscribeFromThread(id));
        }

        mergeThreads(sourceId: string, destinationId: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.mergeThreads(sourceId, destinationId));
        }

        searchThreadsByInitial(name: string): Promise<ThreadRepository.Thread[]> {

            return Pages.getOrShowErrorAndDefault(ThreadRepository.searchThreadsByInitial(name), () => []);
        }

        searchThreadsByName(name: string): Promise<ThreadRepository.Thread[]> {

            return Pages.getOrShowErrorAndDefault(ThreadRepository.searchThreadsByName(name), () => []);
        }

        getSubscribedUsers(id: string): Promise<UserRepository.User[]> {

            return UserRepository.getUsersSubscribedToThread(id);
        }

        addThreadMessage(id: string, content: string): Promise<string> {

            return Pages.getOrShowError(ThreadMessageRepository.addThreadMessage(id, content.trim()));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getTagsCached();
        }
    }

    class ThreadMessageCallback implements IThreadMessageCallback {

        editThreadMessageContent(id: string, newContent: string, changeReason: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(
                ThreadMessageRepository.editThreadMessageContent(id, newContent.trim(), changeReason.trim()));
        }

        moveThreadMessage(id: string, targetThreadId: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.moveThreadMessage(id, targetThreadId));
        }

        deleteThreadMessage(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.deleteThreadMessage(id));
        }

        commentThreadMessage(id: string, comment: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.commentThreadMessage(id, comment.trim()));
        }

        solveThreadMessageComment(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.solveCommentOfThreadMessage(id));
        }

        async getCommentsOfThreadMessage(id: string): Promise<ThreadMessageRepository.ThreadMessageComment[]> {

            return (await ThreadMessageRepository.getThreadMessageComments(id)).messageComments;
        }

        searchThreadMessagesByName(name: string): Promise<ThreadMessageRepository.ThreadMessageCollection> {

            return Pages.getOrShowErrorAndDefault(ThreadMessageRepository.searchThreadMessagesByName(name),
                () => ThreadMessageRepository.defaultThreadMessageCollection());
        }

        upVote(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.upVote(id));
        }

        downVote(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.downVote(id));
        }

        resetVote(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.resetVote(id));
        }
    }

    class UserCallback implements IUserCallback {

        editUserName(id: string, newName: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.editUserName(id, newName.trim()));
        }

        editUserInfo(id: string, newInfo: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.editUserInfo(id, newInfo.trim()));
        }

        editUserTitle(id: string, newTitle: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.editUserTitle(id, newTitle.trim()));
        }

        editUserSignature(id: string, newSignature: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.editUserSignature(id, newSignature.trim()));
        }

        deleteUserLogo(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.deleteUserLogo(id));
        }

        uploadUserLogo(id: string, fileContent: ArrayBuffer): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.editUserLogo(id, fileContent));
        }

        deleteUser(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.deleteUser(id));
        }

        searchUsersByName(name: string): Promise<UserRepository.User[]> {

            return Pages.getOrShowErrorAndDefault(UserRepository.searchUsersByName(name), () => []);
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