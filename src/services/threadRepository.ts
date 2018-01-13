import {CategoryRepository} from "./categoryRepository";
import {UserRepository} from "./userRepository";
import {TagRepository} from "./tagRepository";
import {CommonEntities} from "./commonEntities";
import {RequestHandler} from "./requestHandler";
import {ThreadMessageRepository} from "./threadMessageRepository";

export module ThreadRepository {

    export interface Thread {

        id: string;
        name: string;
        created: number;
        latestVisibleChangeAt: number;
        visitorsSinceLastChange: number;
        subscribedUsersCount: number;
        createdBy: UserRepository.User;
        messageCount: number;
        latestMessage: CategoryRepository.LatestMessage;
        visitedSinceLastChange: boolean;
        tags: TagRepository.Tag[];
        categories: CategoryRepository.Category[];
        lastUpdated: number;
        visited: number;
        voteScore: number;
        pinned: boolean;
        pinDisplayOrder: number;
        subscribedToThread: boolean;
        privileges: string[];
    }

    export interface ThreadCollection extends CommonEntities.PaginationInfo {

        threads: Thread[];
    }

    export interface PinnedThreadCollection extends ThreadCollection {

        pinned_threads: Thread[]
    }

    export interface ThreadWithMessages extends Thread, ThreadMessageRepository.ThreadMessageCollection {

    }

    export interface ThreadWithMessagesResponse {

        thread: ThreadWithMessages;
    }

    export function defaultThreadCollection(): ThreadCollection {

        return {
            threads: [],
            page: 0,
            pageSize: 1,
            totalCount: 0,
        } as ThreadCollection;
    }

    export interface GetThreadsRequest {

        page: number;
        orderBy: string;
        sort: string;
    }

    interface ThreadSearchResult {

        index: number;
        pageSize: number;
    }

    export async function getThreads(request: GetThreadsRequest): Promise<ThreadCollection> {

        return await RequestHandler.get({
            path: 'threads',
            query: request
        }) as ThreadCollection;
    }

    export async function getThreadsWithTag(tag: TagRepository.Tag, request: GetThreadsRequest): Promise<ThreadCollection> {

        return await RequestHandler.get({
            path: 'threads/tag/' + encodeURIComponent(tag.id),
            query: request
        }) as ThreadCollection;
    }

    export async function getThreadsOfUser(user: UserRepository.User, request: GetThreadsRequest): Promise<ThreadCollection> {

        let result = await RequestHandler.get({
            path: 'threads/user/' + encodeURIComponent(user.id),
            query: request
        }) as ThreadCollection;

        if (result.threads && result.threads.length) {

            for (let thread of result.threads) {

                //createdBy might not be populated when querying threads of a user
                thread.createdBy = thread.createdBy || user;
            }
        }

        return result;
    }

    export async function getSubscribedThreadsOfUser(user: UserRepository.User, request: GetThreadsRequest): Promise<ThreadCollection> {

        let result = await RequestHandler.get({
            path: 'threads/subscribed/user/' + encodeURIComponent(user.id),
            query: request
        }) as ThreadCollection;

        if (result.threads && result.threads.length) {

            for (let thread of result.threads) {

                //createdBy might not be populated when querying threads of a user
                thread.createdBy = thread.createdBy || user;
            }
        }

        return result;
    }

    export async function getThreadsOfCategory(category: CategoryRepository.Category,
                                               request: GetThreadsRequest): Promise<ThreadCollection> {

        return appendPinnedThreadCollection(await RequestHandler.get({
            path: 'threads/category/' + encodeURIComponent(category.id),
            query: request
        }) as PinnedThreadCollection);
    }

    export async function getThreadById(id: string, request: GetThreadsRequest): Promise<ThreadWithMessagesResponse> {

        return await RequestHandler.get({
            path: 'threads/id/' + encodeURIComponent(id),
            query: request
        }) as ThreadWithMessagesResponse;
    }

    export async function searchThreadsByName(name: string): Promise<Thread[]> {

        if (name && name.length) {

            let searchResult = await RequestHandler.get({
                path: 'threads/search/' + encodeURIComponent(name),
                query: {}
            }) as ThreadSearchResult;
            const pageNumber = Math.floor(searchResult.index / searchResult.pageSize);
            const firstIndexInPage = pageNumber * searchResult.pageSize;

            let collectionPromises: Promise<ThreadCollection>[] = [

                getThreads({
                    page: pageNumber,
                    orderBy: 'name',
                    sort: 'ascending'
                })
            ];

            if (pageNumber != firstIndexInPage) {

                collectionPromises.push(getThreads({
                    page: pageNumber + 1,
                    orderBy: 'name',
                    sort: 'ascending'
                }));
            } else {

                collectionPromises.push(Promise.resolve(defaultThreadCollection()));
            }

            const collections = await Promise.all(collectionPromises);

            let threads = collections[0].threads.slice(searchResult.index - firstIndexInPage);

            let remaining = searchResult.pageSize - threads.length;
            if (remaining > 0) {

                threads = threads.concat(collections[1].threads.slice(0, remaining));
            }

            return threads;
        }
        return Promise.resolve([]);
    }

    function appendPinnedThreadCollection(collection: PinnedThreadCollection): ThreadCollection {

        let oldThreads = collection.threads;
        collection.pinned_threads = collection.pinned_threads || [];
        collection.threads = collection.pinned_threads;

        let pinnedThreadIds = {};

        for (let thread of collection.pinned_threads) {

            pinnedThreadIds[thread.id] = true;
        }

        for (let thread of oldThreads) {

            if (pinnedThreadIds.hasOwnProperty(thread.id)) continue;

            collection.threads.push(thread);
        }

        return collection;
    }

    export async function createThread(name: string): Promise<string> {

        return (await RequestHandler.post({
            path: 'threads/',
            stringData: name
        })).id;
    }

    export async function deleteThread(threadId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'threads/' + encodeURIComponent(threadId)
        });
    }

    export async function editThreadName(threadId: string, newName: string): Promise<void> {

        await RequestHandler.put({
            path: 'threads/name/' + encodeURIComponent(threadId),
            stringData: newName
        });
    }

    export async function editThreadPinDisplayOrder(threadId: string, newDisplayOrder: number): Promise<void> {

        await RequestHandler.put({
            path: 'threads/pindisplayorder/' + encodeURIComponent(threadId),
            stringData: newDisplayOrder.toString()
        });
    }

    export async function addTagToThread(threadId: string, tagId: string): Promise<void> {

        await RequestHandler.post({
            path: 'threads/tag/' + encodeURIComponent(threadId) + '/' + encodeURIComponent(tagId)
        });
    }

    export async function removeTagFromThread(threadId: string, tagId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'threads/tag/' + encodeURIComponent(threadId) + '/' + encodeURIComponent(tagId)
        });
    }

    export async function subscribeToThread(threadId: string): Promise<void> {

        await RequestHandler.post({
            path: 'threads/subscribe/' + encodeURIComponent(threadId)
        });
    }

    export async function unSubscribeFromThread(threadId: string): Promise<void> {

        await RequestHandler.post({
            path: 'threads/unsubscribe/' + encodeURIComponent(threadId)
        });
    }

    export async function mergeThreads(sourceThreadId: string, destinationThreadId: string): Promise<void> {

        await RequestHandler.post({
            path: 'threads/merge/' + encodeURIComponent(sourceThreadId) + '/' + encodeURIComponent(destinationThreadId)
        });
    }
}