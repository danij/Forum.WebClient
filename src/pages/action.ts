import {TagRepository} from '../services/tagRepository';
import {ThreadRepository} from '../services/threadRepository';
import {UserRepository} from '../services/userRepository';
import {ThreadMessageRepository} from '../services/threadMessageRepository';
import {CategoryRepository} from '../services/categoryRepository';
import {Pages} from './common';
import {PrivilegesRepository} from '../services/privilegesRepository';
import {AuthRepository} from '../services/authRepository';
import {RequestHandler} from '../services/requestHandler';
import {PrivateMessageRepository} from "../services/privateMessageRepository";

export module PageActions {

    import PrivateMessageCollection = PrivateMessageRepository.PrivateMessageCollection;

    interface ActionConfig {

        multiTagInputSeparator: string;
    }

    declare const actionConfig: ActionConfig;

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

        createTagAndGetId(name: string): Promise<string>;

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

        approve(id: string): Promise<boolean>;

        unapprove(id: string): Promise<boolean>;
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

        approve(id: string): Promise<boolean>;

        unapprove(id: string): Promise<boolean>;
    }

    export interface IPrivateMessageCallback {

        getReceivedPrivateMessages(page: number): Promise<PrivateMessageCollection>;

        getSentPrivateMessages(page: number): Promise<PrivateMessageCollection>;

        sendPrivateMessage(destinationId: string, content: string): Promise<boolean>;

        deletePrivateMessage(messageId: string): Promise<boolean>;
    }

    export interface IUserCallback {

        createUser(name: string): Promise<boolean>;

        editUserName(id: string, newName: string): Promise<boolean>;

        editUserInfo(id: string, newTitle: string): Promise<boolean>;

        editUserTitle(id: string, newTitle: string): Promise<boolean>;

        editUserSignature(id: string, newSignature: string): Promise<boolean>;

        deleteUserLogo(id: string): Promise<boolean>;

        uploadUserLogo(id: string, fileContent: ArrayBuffer): Promise<boolean>;

        deleteUser(id: string): Promise<boolean>;

        searchUsersByName(name: string): Promise<UserRepository.User[]>;
    }

    export interface IAuthCallback {

        getCurrentUser(): Promise<UserRepository.CurrentUser>;

        usingCustomAuthentication(): boolean;

        logout(): Promise<void>;

        registerCustomAuth(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                           minAge: number, notARobotResponse: string): Promise<boolean>;

        loginCustom(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                    showInOnlineUsers: boolean): Promise<boolean>;

        changeCustomPassword(email: string, oldPassword: string, newPassword: string,
                             notARobotResponse: string): Promise<boolean>;

        resetCustomPassword(email: string, acceptPrivacy: boolean, acceptTos: boolean,
                            notARobotResponse: string): Promise<boolean>;
    }

    export interface IPrivilegesCallback {

        getThreadMessageRequiredPrivileges(messageId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection>;

        getThreadRequiredPrivileges(threadId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection>;

        getTagRequiredPrivileges(tagId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection>;

        getCategoryRequiredPrivileges(categoryId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection>;

        getForumWideRequiredPrivileges(): Promise<PrivilegesRepository.RequiredPrivilegesCollection>;

        getThreadMessageAssignedPrivileges(messageId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection>;

        getThreadAssignedPrivileges(threadId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection>;

        getTagAssignedPrivileges(tagId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection>;

        getCategoryAssignedPrivileges(categoryId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection>;

        getForumWideAssignedPrivileges(): Promise<PrivilegesRepository.AssignedPrivilegesCollection>;

        getPrivilegesAssignedToUser(userId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection>;
    }

    export interface IDocumentationCallback {

        getContent(source: string) : Promise<string>;
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

            return TagRepository.getAllTags();
        }
    }

    class TagCallback implements ITagCallback {

        async createTag(name: string): Promise<boolean> {

            const tags = name.split(actionConfig.multiTagInputSeparator)
                .map(tagName => tagName.trim())
                .filter(tagName => tagName.length);

            const promises = tags.map(tagName => Pages.trueOrShowErrorAndFalse(TagRepository.addNewTag(tagName)));
            const results = await Promise.all(promises);

            return results.reduceRight((accumulator, currentValue) => accumulator && currentValue);
        }

        async createTagAndGetId(name: string): Promise<string> {

            return Pages.getOrShowErrorAndDefault(TagRepository.addNewTag(name.trim()), () => '');
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

            return TagRepository.getAllTags();
        }
    }

    class ThreadCallback implements IThreadCallback {

        async createThread(name: string, tagIds: string[], content: string): Promise<string> {

            const result = await Pages.getOrShowError(ThreadRepository.createThread(name));

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

            return Pages.getOrShowErrorAndDefault(UserRepository.getUsersSubscribedToThread(id), () => []);
        }

        addThreadMessage(id: string, content: string): Promise<string> {

            return Pages.getOrShowError(ThreadMessageRepository.addThreadMessage(id, content.trim()));
        }

        getAllTags(): Promise<TagRepository.Tag[]> {

            return TagRepository.getAllTags();
        }

        approve(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.editThreadApproved(id, true));
        }

        unapprove(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadRepository.editThreadApproved(id, false));
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

        approve(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.editThreadMessageApproved(id, true));
        }

        unapprove(id: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(ThreadMessageRepository.editThreadMessageApproved(id, false));
        }
    }

    class PrivateMessageCallback implements IPrivateMessageCallback {

        getReceivedPrivateMessages(page: number): Promise<PrivateMessageCollection> {

            return PrivateMessageRepository.getReceivedPrivateMessages({
                page: page
            });
        }

        getSentPrivateMessages(page: number): Promise<PrivateMessageCollection> {

            return PrivateMessageRepository.getSentPrivateMessages({
                page: page
            });
        }

        sendPrivateMessage(destinationId: string, content: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(PrivateMessageRepository.sendPrivateMessage(destinationId, content.trim()));
        }

        deletePrivateMessage(messageId: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(PrivateMessageRepository.deletePrivateMessage(messageId));
        }
    }

    class UserCallback implements IUserCallback {

        createUser(name: string): Promise<boolean> {

            return Pages.trueOrShowErrorAndFalse(UserRepository.createUserName(name.trim()));
        }

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

    class AuthCallback implements IAuthCallback {

        getCurrentUser(): Promise<UserRepository.CurrentUser> {

            return Pages.getOrShowError(UserRepository.getCurrentUser());
        }

        usingCustomAuthentication(): boolean {

            return AuthRepository.usingCustomAuthentication();
        }

        async logout(): Promise<void> {

            await Pages.getOrShowError(AuthRepository.logout());
            location.reload();
        }

        registerCustomAuth(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                                 minAge: number, notARobotResponse: string): Promise<boolean> {

            return Pages.getOrShowErrorAndDefault(
                AuthRepository.registerCustomAuth(email, password, acceptPrivacy, acceptTos, minAge, notARobotResponse),
                () => false);
        }

        loginCustom(email: string, password: string, acceptPrivacy: boolean, acceptTos: boolean,
                    showInOnlineUsers: boolean): Promise<boolean> {

            return Pages.getOrShowErrorAndDefault(
                AuthRepository.loginCustomAuth(email, password, acceptPrivacy, acceptTos, showInOnlineUsers),
                () => false);
        }

        changeCustomPassword(email: string, oldPassword: string, newPassword: string,
                             notARobotResponse: string): Promise<boolean> {

            return Pages.getOrShowErrorAndDefault(
                AuthRepository.changeCustomPassword(email, oldPassword, newPassword, notARobotResponse), () => false);
        }

        resetCustomPassword(email: string, acceptPrivacy: boolean, acceptTos: boolean,
                            notARobotResponse: string): Promise<boolean> {

            return Pages.getOrShowErrorAndDefault(
                AuthRepository.resetCustomPassword(email, acceptPrivacy, acceptTos, notARobotResponse),() => false);
        }
    }

    class PrivilegesCallback implements IPrivilegesCallback {

        getThreadMessageRequiredPrivileges(messageId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getThreadMessageRequiredPrivileges(messageId),
                () => ({} as PrivilegesRepository.RequiredPrivilegesCollection));
        }

        getThreadRequiredPrivileges(threadId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getThreadRequiredPrivileges(threadId),
                () => ({} as PrivilegesRepository.RequiredPrivilegesCollection));
        }

        getTagRequiredPrivileges(tagId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getTagRequiredPrivileges(tagId),
                () => ({} as PrivilegesRepository.RequiredPrivilegesCollection));
        }

        getCategoryRequiredPrivileges(categoryId: string): Promise<PrivilegesRepository.RequiredPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getCategoryRequiredPrivileges(categoryId),
                () => ({} as PrivilegesRepository.RequiredPrivilegesCollection));
        }

        getForumWideRequiredPrivileges(): Promise<PrivilegesRepository.RequiredPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getForumWideRequiredPrivileges(),
                () => ({} as PrivilegesRepository.RequiredPrivilegesCollection));
        }
        
        getThreadMessageAssignedPrivileges(messageId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getThreadMessageAssignedPrivileges(messageId),
                () => ({} as PrivilegesRepository.AssignedPrivilegesCollection));
        }

        getThreadAssignedPrivileges(threadId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getThreadAssignedPrivileges(threadId),
                () => ({} as PrivilegesRepository.AssignedPrivilegesCollection));
        }

        getTagAssignedPrivileges(tagId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getTagAssignedPrivileges(tagId),
                () => ({} as PrivilegesRepository.AssignedPrivilegesCollection));
        }

        getCategoryAssignedPrivileges(categoryId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getCategoryAssignedPrivileges(categoryId),
                () => ({} as PrivilegesRepository.AssignedPrivilegesCollection));
        }

        getForumWideAssignedPrivileges(): Promise<PrivilegesRepository.AssignedPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getForumWideAssignedPrivileges(),
                () => ({} as PrivilegesRepository.AssignedPrivilegesCollection));
        }

        getPrivilegesAssignedToUser(userId: string): Promise<PrivilegesRepository.AssignedPrivilegesCollection> {

            return Pages.getOrShowErrorAndDefault(PrivilegesRepository.getPrivilegesAssignedToUser(userId),
                () => ({} as PrivilegesRepository.AssignedPrivilegesCollection));
        }
    }

    class DocumentationCallback implements IDocumentationCallback {

        getContent(source: string): Promise<string> {

            return RequestHandler.get({

                path: `../doc/${source}.md`,
                doNotParse: true
            })
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

    export function getPrivateMessageCallback(): IPrivateMessageCallback {

        return new PrivateMessageCallback();
    }

    export function getUserCallback(): IUserCallback {

        return new UserCallback();
    }

    export function getAuthCallback(): IAuthCallback {

        return new AuthCallback();
    }

    export function getPrivilegesCallback(): IPrivilegesCallback {

        return new PrivilegesCallback();
    }

    export function getDocumentationCallback(): IDocumentationCallback {

        return new DocumentationCallback();
    }
}