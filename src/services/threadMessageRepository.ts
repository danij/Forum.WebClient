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

    export interface ThreadMessageRankInfo {

        id: string;
        parentId: string;
        rank: number;
        pageSize: number;
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

    export interface ThreadMessageComment {

        id: string;
        created: number;
        solved: boolean;
        content: string;
        ip: string;
        createdBy: UserRepository.User
    }

    export interface ThreadMessageCommentCollection extends CommonEntities.PaginationInfo {

        message_comments: ThreadMessageComment[];
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

    export async function getThreadMessageRank(threadMessageId: string) : Promise<ThreadMessageRankInfo> {

        return await RequestHandler.get({
            path: 'thread_messages/rank/' + encodeURIComponent(threadMessageId)
        }) as ThreadMessageRankInfo;
    }

    export async function getThreadMessageComments(messageId: string) : Promise<ThreadMessageCommentCollection> {

        return await RequestHandler.get({
            path: 'thread_messages/comments/' + encodeURIComponent(messageId),
            query: {
                'page': 0,
                'sort': 'descending'
            }
        }) as ThreadMessageCommentCollection;
    }

    export async function addThreadMessage(threadId: string, content: string): Promise<string> {

        return (await RequestHandler.post({
            path: 'thread_messages/' + encodeURIComponent(threadId),
            stringData: content
        })).id || '';
    }

    export async function editThreadMessageContent(messageId: string, newContent: string, changeReason: string): Promise<void> {

        await RequestHandler.put({
            path: 'thread_messages/content/' + encodeURIComponent(messageId) + '/' + encodeURIComponent(changeReason),
            stringData: newContent
        });
    }

    export async function moveThreadMessage(messageId: string, targetThreadId: string): Promise<void> {

        await RequestHandler.post({
            path: 'thread_messages/move/' + encodeURIComponent(messageId) + '/' + encodeURIComponent(targetThreadId)
        });
    }

    export async function deleteThreadMessage(messageId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'thread_messages/' + encodeURIComponent(messageId)
        });
    }

    export async function commentThreadMessage(messageId: string, comment: string): Promise<void> {

        await RequestHandler.post({
            path: 'thread_messages/comment/' + encodeURIComponent(messageId),
            stringData: comment
        });
    }

    export async function solveCommentOfThreadMessage(commentId: string): Promise<void> {

        await RequestHandler.put({
            path: 'thread_messages/comment/solved/' + encodeURIComponent(commentId),
        });
    }
}