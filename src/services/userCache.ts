import {UserRepository} from "./userRepository";
import {ThreadRepository} from "./threadRepository";
import {TagRepository} from "./tagRepository";
import {CategoryRepository} from "./categoryRepository";
import {ThreadMessageRepository} from "./threadMessageRepository";
import {CommonEntities} from "./commonEntities";
import {PrivateMessageRepository} from "./privateMessageRepository";
import {AttachmentsRepository} from "./attachmentsRepository";

export module UserCache {

    const usersById: any = {};
    const idsByName: any = {};

    function getUserIdForCache(id: string) : string {

        return id.toLowerCase().replace(/-/g, '');
    }

    export function process(user: UserRepository.User): void {

        if ( ! user) return;
        if ( ! user.id) return;

        usersById[getUserIdForCache(user.id)] = user;
        idsByName[user.name.toLowerCase()] = user.id;
    }

    export function processUsers(users: UserRepository.User[]): void {

        if ( ! users) return;

        users.forEach(user => process(user));
    }

    export function processCollection(collection: UserRepository.UserCollection): void {

        if ( ! collection) return;

        processUsers(collection.users);
    }

    export function processThread(thread: ThreadRepository.Thread): void {

        if ( ! thread) return;

        process(thread.createdBy);
        processLatestMessage(thread.latestMessage);
        processTags(thread.tags);
        processCategories(thread.categories);
    }

    export function processThreadWithMessages(thread: ThreadRepository.ThreadWithMessages): void {

        processThread(thread);
        processMessageCollection(thread);
    }

    export function processThreads(threads: ThreadRepository.Thread[]): void {

        if ( ! threads) return;

        threads.forEach(thread => processThread(thread));
    }

    export function processThreadCollection(collection: ThreadRepository.ThreadCollection): void {

        if ( ! collection) return;

        processThreads(collection.threads);
    }

    export function processTag(tag: TagRepository.Tag): void {

        if ( ! tag) return;

        processCategories(tag.categories);
        processLatestMessage(tag.latestMessage);
    }

    export function processTags(tags: TagRepository.Tag[]): void {

        if ( ! tags) return;

        tags.forEach(tag => processTag(tag));
    }

    export function processCategory(category: CategoryRepository.Category): void {

        if ( ! category) return;

        processTags(category.tags);
        processLatestMessage(category.latestMessage);
        processCategories(category.children);
    }

    export function processCategories(categories: CategoryRepository.Category[]): void {

        if ( ! categories) return;

        categories.forEach(category => processCategory(category));
    }

    export function processLatestMessage(latestMessage: ThreadMessageRepository.LatestMessage): void {

        if ( ! latestMessage) return;

        process(latestMessage.createdBy);
    }

    export function processMessage(message: ThreadMessageRepository.ThreadMessage): void {

        if ( ! message) return;

        process(message.createdBy);
        processThread(message.parentThread);
    }

    export function processMessages(messages: ThreadMessageRepository.ThreadMessage[]): void {

        if ( ! messages) return;

        messages.forEach(message => processMessage(message));
    }

    export function processMessageCollection(collection: ThreadMessageRepository.ThreadMessageCollection): void {

        if ( ! collection) return;

        processMessages(collection.messages);
    }

    export function processComment(comment: ThreadMessageRepository.ThreadMessageComment): void {

        if ( ! comment) return;

        process(comment.createdBy);
        processMessage(comment.message);
    }

    export function processComments(comments: ThreadMessageRepository.ThreadMessageComment[]): void {

        if ( ! comments) return;

        comments.forEach(comment => processComment(comment));
    }

    export function processCommentCollection(collection: ThreadMessageRepository.ThreadMessageCommentCollection): void {

        if ( ! collection) return;

        processComments(collection.messageComments);
    }

    export function processPrivateMessage(message: PrivateMessageRepository.PrivateMessage): void {

        if ( ! message) return;

        process(message.source);
        process(message.destination);
    }

    export function processPrivateMessages(messages: PrivateMessageRepository.PrivateMessage[]): void {

        if ( ! messages) return;

        messages.forEach(message => processPrivateMessage(message));
    }

    export function processPrivateMessageCollection(collection: PrivateMessageRepository.PrivateMessageCollection): void {

        if ( ! collection) return;

        processPrivateMessages(collection.messages);
    }

    export function processAttachment(attachment: AttachmentsRepository.Attachment): void {

        if ( ! attachment) return;

        process(attachment.createdBy);
    }

    export function processAttachments(attachments: AttachmentsRepository.Attachment[]): void {

        if ( ! attachments) return;

        attachments.forEach(attachment => processAttachment(attachment));
    }

    export function processAttachmentCollection(collection: AttachmentsRepository.AttachmentCollection): void {

        if ( ! collection) return;

        processAttachments(collection.attachments);
    }

    export function searchNames(names: string[]): Promise<void> {

         return searchUniqueNames(Array.from(new Set(
             names
                 .map(n => n.toLowerCase())
                 .filter(n => ! (n in idsByName)))));
    }

    async function searchUniqueNames(names: string[]): Promise<void> {

        if (names.length < 1) return;

        const batches = getBatches(names, CommonEntities.getCacheConfig().userRetrieveBatchSize);

        for (const batch of batches) {

            const ids = await UserRepository.getMultipleByName(batch);

            for (let i = 0; i < batch.length; ++i) {

                idsByName[batch[i]] = ids[i];
            }
        }
    }

    export function searchUsersById(ids: string[]): Promise<void> {

        return searchUniqueUsersById(Array.from(new Set(
            ids
                .map(n => getUserIdForCache(n))
                .filter(n => ! (n in usersById)))));
    }

    async function searchUniqueUsersById(ids: string[]): Promise<void> {

        if (ids.length < 1) return;

        const batches = getBatches(ids, CommonEntities.getCacheConfig().userRetrieveBatchSize);

        for (const batch of batches) {

            const users = await UserRepository.getMultipleById(batch);
            for (let i = 0; i < batch.length; ++i) {

                usersById[getUserIdForCache(batch[i])] = users[i];
            }
        }
    }

    function getBatches<T>(input: T[], size: number): T[][] {

        const result: T[][] = [];

        for (let i = 0; i < input.length; i += size) {

            result.push(input.slice(i, i + size));
        }

        return result;
    }

    export function getIdByName(name: string): string {

        return idsByName[name.toLowerCase()];
    }

    export function getUserById(id: string): UserRepository.User {

        return usersById[getUserIdForCache(id)];
    }

    export async function getUserByName(name: string): Promise<UserRepository.User> {

        const id = getIdByName(name);
        if (id) {

            return getUserById(id);
        }

        const user = await UserRepository.getUserByName(name);
        if (user) {

            idsByName[name.toLowerCase()] = user.id;
            usersById[getUserIdForCache(user.id.toLowerCase())] = user;
        }

        return user;
    }
}