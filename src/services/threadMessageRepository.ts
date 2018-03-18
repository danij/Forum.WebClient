import {RequestHandler} from "./requestHandler";
import {CommonEntities} from "./commonEntities";
import {UserRepository} from "./userRepository";
import {ThreadRepository} from "./threadRepository";

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
        voteStatus: number;
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

    export function createThreadMessageCollection(messages: ThreadMessage[]): ThreadMessageCollection {

        return filterNulls({
            messages: messages,
            page: 0,
            pageSize: messages.length,
            totalCount: messages.length,
        });
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
        createdBy: UserRepository.User,
        message?: ThreadMessage
    }

    export interface ThreadMessageCommentCollection extends CommonEntities.PaginationInfo {

        messageComments: ThreadMessageComment[];
    }

    export class GetThreadMessageCommentsRequest {

        page: number;
        sort: string;
    }

    export function defaultThreadMessageCommentCollection(): ThreadMessageCommentCollection {

        return {
            messageComments: [],
            page: 0,
            pageSize: 1,
            totalCount: 0,
        } as ThreadMessageCommentCollection;
    }

    function filterMessageNulls(message: ThreadMessage): ThreadMessage {

        message = filterMessageNullsWithoutParentThread(message);

        if (message.parentThread) {

            ThreadRepository.filterThreadNulls(message.parentThread);
        }

        return message;
    }

    export function filterMessageNullsWithoutParentThread(message: ThreadMessage): ThreadMessage {

        message.createdBy = message.createdBy || UserRepository.UnknownUser;

        return message;
    }

    function filterNulls(value: any): ThreadMessageCollection {

        let result = value as ThreadMessageCollection;

        result.messages = (result.messages || []).filter(t => null != t);

        for (let message of result.messages) {

            filterMessageNulls(message);
        }

        return result;
    }

    function filterCommentNulls(value: any): ThreadMessageCommentCollection {

        let result = value as ThreadMessageCommentCollection;

        result.messageComments = (result.messageComments || []).filter(t => null != t);

        for (let comment of result.messageComments) {

            comment.createdBy = comment.createdBy || UserRepository.UnknownUser;

            if (comment.message) {

                filterMessageNulls(comment.message);
            }
        }

        return result;
    }

    export async function getLatestThreadMessages(): Promise<ThreadMessageCollection> {

        return filterNulls(await RequestHandler.get({
            path: 'thread_messages/latest'
        }));
    }

    export async function getThreadMessagesOfUser(user: UserRepository.User, request: GetThreadMessagesRequest): Promise<ThreadMessageCollection> {

        let result = filterNulls(await RequestHandler.get({
            path: 'thread_messages/user/' + encodeURIComponent(user.id),
            query: request
        }));

        result.messages = result.messages || [];
        for (let message of result.messages) {

            message.createdBy = message.createdBy || user;
        }
        return result;
    }

    export async function getThreadMessageRank(threadMessageId: string): Promise<ThreadMessageRankInfo> {

        return await RequestHandler.get({
            path: 'thread_messages/rank/' + encodeURIComponent(threadMessageId)
        }) as ThreadMessageRankInfo;
    }

    export async function getThreadMessageComments(messageId: string): Promise<ThreadMessageCommentCollection> {

        return filterCommentNulls(await RequestHandler.get({
            path: 'thread_messages/comments/' + encodeURIComponent(messageId)
        }));
    }

    export async function getAllThreadMessageComments(request: GetThreadMessageCommentsRequest): Promise<ThreadMessageCommentCollection> {

        return filterCommentNulls(await RequestHandler.get({
            path: 'thread_messages/allcomments',
            query: request
        }));
    }

    export async function getThreadMessageCommentsWrittenByUser(userId: string,
                                                                request: GetThreadMessageCommentsRequest): Promise<ThreadMessageCommentCollection> {

        return filterCommentNulls(await RequestHandler.get({
            path: 'thread_messages/comments/user/' + encodeURIComponent(userId),
            query: request
        }));
    }

    export async function getThreadMessagesById(ids: string[]): Promise<ThreadMessageCollection> {

        return createThreadMessageCollection((await RequestHandler.get({
            path: 'thread_messages/multiple/' + encodeURIComponent(ids.join(','))
        })).thread_messages);
    }

    export async function searchThreadMessagesByName(name: string): Promise<ThreadMessageCollection> {

        let idsResult = await RequestHandler.get({
            path: '../search/thread_messages?q=' + encodeURIComponent(name)
        });

        if (idsResult && idsResult.thread_message_ids && idsResult.thread_message_ids.length) {

            return await getThreadMessagesById(idsResult.thread_message_ids);
        }
        else {
            return defaultThreadMessageCollection();
        }
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

    export async function upVote(messageId: string): Promise<void> {

        await RequestHandler.post({
            path: 'thread_messages/upvote/' + encodeURIComponent(messageId),
        });
    }

    export async function downVote(messageId: string): Promise<void> {

        await RequestHandler.post({
            path: 'thread_messages/downvote/' + encodeURIComponent(messageId),
        });
    }

    export async function resetVote(messageId: string): Promise<void> {

        await RequestHandler.post({
            path: 'thread_messages/resetvote/' + encodeURIComponent(messageId),
        });
    }
}