import {CategoryRepository} from "./categoryRepository";
import {UserRepository} from "./userRepository";
import {TagRepository} from "./tagRepository";
import {CommonEntities} from "./commonEntities";
import {RequestHandler} from "./requestHandler";

export module ThreadRepository {

    import LatestMessage = CategoryRepository.LatestMessage;

    export interface Thread {

        id: string;
        name: string;
        created: number;
        latestVisibleChangeAt: number;
        visitorsSinceLastChange: number;
        subscribedUsersCount: number;
        createdBy: UserRepository.User;
        messageCount: number;
        latestMessage: LatestMessage;
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
}