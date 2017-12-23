import {RequestHandler} from "./requestHandler";
import {CommonEntities} from "./commonEntities";

export module UserRepository {

    export interface User {

        id: string;
        name: string;
        info: string;
        title: string;
        signature: string;
        hasLogo: boolean;
        created: number;
        lastSeen: number;
        threadCount: number;
        messageCount: number;
        subscribedThreadCount: number;
        receivedUpVotes: number;
        receivedDownVotes: number;
    }

    export interface UserCollection extends CommonEntities.PaginationInfo {

        users: User[];
    }

    interface SingleUser {

        user: User;
    }

    export function defaultUserCollection(): UserCollection {

        return {
            users: [],
            page: 0,
            pageSize: 1,
            totalCount: 0,
        } as UserCollection;
    }

    export interface GetUsersRequest {

        page: number;
        orderBy: string;
        sort: string;
    }

    export async function getUsers(request: GetUsersRequest): Promise<UserCollection> {

        return await RequestHandler.get({
            path: 'users',
            query: request
        }) as UserCollection;
    }

    export async function getUserByName(name: string): Promise<User> {

        return (await RequestHandler.get({
            path: 'users/name/' + encodeURIComponent(name)
        }) as SingleUser).user;
    }
}