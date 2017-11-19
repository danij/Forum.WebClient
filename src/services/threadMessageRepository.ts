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
        privileges: string[];
    }

    export interface ThreadMessageCollection extends CommonEntities.PaginationInfo {

        messages: ThreadMessage[];
    }

    export async function getLatestThreadMessages() : Promise<ThreadMessageCollection> {

        return await RequestHandler.get({
            path: 'thread_messages/latest'
        }) as ThreadMessageCollection;
    }
}