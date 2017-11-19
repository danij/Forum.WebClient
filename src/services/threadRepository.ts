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
}