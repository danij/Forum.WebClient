import {ThreadRepository} from "./threadRepository";
import {RequestHandler} from "./requestHandler";
import {CommonEntities} from "./commonEntities";
import {UserRepository} from "./userRepository";

export module ThreadMessageRepository {

    export interface ThreadMessageVote {

        userId: string;
        userName: string;
        at: number;
    }

    export interface ThreadMessageLastUpdated {

        userId: string;
        userName: string;
        at: number;
        reason: string;
    }

    export interface ThreadMessage {

        id: string;
        created: number;
        createdBy: UserRepository.User;
        commentsCount: number;
        solvedCommentsCount: number;
        content: string;
        parentThread: ThreadRepository.Thread;
        ip: string;
        upVotes: ThreadMessageVote[];
        downVotes: ThreadMessageVote[];
        lastUpdated: ThreadMessageLastUpdated;
        privileges: string[];
    }

    export interface ThreadMessageCollection extends CommonEntities.PaginationInfo {

        messages: ThreadMessage[];
    }

    export function defaultThreadMessageCollection(): ThreadMessageCollection {

        return {
            messages: [],
            page: 0,
            pageSize: 1,
            totalCount: 0,
        } as ThreadMessageCollection;
    }

    export class GetThreadMessagesRequest {

        page: number;
        sort: string;
    }

    export async function getLatestThreadMessages() : Promise<ThreadMessageCollection> {

        return await RequestHandler.get({
            path: 'thread_messages/latest'
        }) as ThreadMessageCollection;
    }

    export async function getThreadMessagesOfUser(user: UserRepository.User, request: GetThreadMessagesRequest) : Promise<ThreadMessageCollection> {

        let result = await RequestHandler.get({
            path: 'thread_messages/user/' + encodeURIComponent(user.id),
            query: request
        }) as ThreadMessageCollection;

        result.messages = result.messages || [];
        for (let message of result.messages) {

            message.createdBy = message.createdBy || user;
        }
        return result;
    }
}