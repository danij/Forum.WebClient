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
        upVotes: number;
        downVotes: number;
    }

    export interface UserCollection extends CommonEntities.PaginationInfo {

        users: User[];
    }

    export async function getUsers(): Promise<UserCollection> {

        return await RequestHandler.get({
            path: 'users'
        }) as UserCollection;
    }

}