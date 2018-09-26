import {RequestHandler} from './requestHandler';
import {CommonEntities} from './commonEntities';
import {UserCache} from "./userCache";
import {ThreadMessageRepository} from "./threadMessageRepository";

export module UserRepository {

    export interface User extends CommonEntities.PrivilegesArray {

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
        privileges: string[];
    }

    export interface CurrentUser {

        authenticated: number;
        user: User;
        newReceivedVotesNr: number;
        newReceivedQuotesNr: number;
    }

    export interface Vote {

        at: number;
        score: number;
        message: ThreadMessageRepository.ThreadMessage;
    }

    export interface VoteHistory {

        lastRetrievedAt: number;
        receivedVotes: Vote[];
    }

    export interface QuoteHistory {

        messages: ThreadMessageRepository.ThreadMessage[];
    }

    export const EmptyUserId: string = '';

    export const AnonymousUserName: string = '<anonymous>';
    export const UnknownUserName: string = '<unknown>';

    export const UnknownUser = {

        id: EmptyUserId,
        name: UnknownUserName,
        info: '',
        title: '',
        created: 0,
        lastSeen: 0

    } as User;

    export interface UserCollection extends CommonEntities.PaginationInfo {

        users: User[];
    }

    interface SingleUser {

        user: User;
    }

    interface OnlineUserCollection {

        online_users: User[];
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

    interface UserSearchResult {

        index: number;
        pageSize: number;
    }

    export function isValidUser(user: User): boolean {

        return (null != user) && (EmptyUserId != user.id) && ('00000000-0000-0000-0000-000000000000' != user.id);
    }

    export function sortByName(users: User[]): void {

        users.sort((first, second) => {

            return first.name.toLocaleLowerCase().localeCompare(second.name.toLocaleLowerCase());
        });
    }

    export async function getCurrentUser(): Promise<CurrentUser> {

        const result = await RequestHandler.get({
            path: 'users/current'
        }) as CurrentUser;

        UserCache.process(result.user);

        return result;
    }

    export async function getUsers(request: GetUsersRequest): Promise<UserCollection> {

        const result = await RequestHandler.get({
            path: 'users',
            query: request
        }) as UserCollection;

        UserCache.processCollection(result);

        return result;
    }

    export async function getUserByName(name: string): Promise<User> {

        const result = (await RequestHandler.get({
            path: 'users/name/' + encodeURIComponent(name)
        }) as SingleUser).user;

        UserCache.process(result);

        return result;
    }

    export async function getUsersSubscribedToThread(threadId: string): Promise<User[]> {

        const collection = (await RequestHandler.get({
            path: 'users/subscribed/thread/' + encodeURIComponent(threadId)
        }) as UserCollection);

        collection.users = collection.users || [];
        UserRepository.sortByName(collection.users);

        UserCache.processCollection(collection);

        return collection.users;
    }

    export async function getOnlineUsers(): Promise<User[]> {

        const result = (await RequestHandler.get({
            path: 'users/online',
        }) as OnlineUserCollection).online_users || [];

        UserCache.processUsers(result);

        return result;
    }

    export async function getMultipleById(ids: string[]): Promise<string[]> {

        return (await RequestHandler.get({
            path: 'users/multiple/ids/' + encodeURIComponent(ids.join(','))
        })).users;
    }

    export async function getMultipleByName(names: string[]): Promise<string[]> {

        return (await RequestHandler.get({
            path: 'users/multiple/names/' + encodeURIComponent(names.join(','))
        })).user_ids;
    }

    export async function createUserName(name: string): Promise<void> {

        await RequestHandler.post({
            path: 'users',
            stringData: name
        });
    }

    export async function editUserName(userId: string, newName: string): Promise<void> {

        await RequestHandler.put({
            path: 'users/name/' + encodeURIComponent(userId),
            stringData: newName
        });
    }

    export async function editUserInfo(userId: string, newInfo: string): Promise<void> {

        await RequestHandler.put({
            path: 'users/info/' + encodeURIComponent(userId),
            stringData: newInfo
        });
    }

    export async function editUserTitle(userId: string, newTitle: string): Promise<void> {

        await RequestHandler.put({
            path: 'users/title/' + encodeURIComponent(userId),
            stringData: newTitle
        });
    }

    export async function editUserSignature(userId: string, newSignature: string): Promise<void> {

        await RequestHandler.put({
            path: 'users/signature/' + encodeURIComponent(userId),
            stringData: newSignature
        });
    }

    export async function deleteUserLogo(userId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'users/logo/' + encodeURIComponent(userId)
        });
    }

    export async function editUserLogo(userId: string, fileContent: ArrayBuffer): Promise<void> {

        await RequestHandler.put({
            path: 'users/logo/' + encodeURIComponent(userId),
            binaryData: fileContent
        });
    }

    export async function deleteUser(userId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'users/' + encodeURIComponent(userId)
        });
    }

    export async function searchUsersByName(name: string): Promise<User[]> {

        if (name && name.length) {

            const searchResult = await RequestHandler.get({
                path: 'users/search/' + encodeURIComponent(name),
                query: {}
            }) as UserSearchResult;
            const pageNumber = Math.floor(searchResult.index / searchResult.pageSize);
            const firstIndexInPage = pageNumber * searchResult.pageSize;

            const collectionPromises: Promise<UserCollection>[] = [

                getUsers({
                    page: pageNumber,
                    orderBy: 'name',
                    sort: 'ascending'
                })
            ];

            if (pageNumber != firstIndexInPage) {

                collectionPromises.push(getUsers({
                    page: pageNumber + 1,
                    orderBy: 'name',
                    sort: 'ascending'
                }));
            } else {

                collectionPromises.push(Promise.resolve(defaultUserCollection()));
            }

            const collections = await Promise.all(collectionPromises);

            let users = collections[0].users.slice(searchResult.index - firstIndexInPage);

            const remaining = searchResult.pageSize - users.length;
            if (remaining > 0) {

                users = users.concat(collections[1].users.slice(0, remaining));
            }

            return users;
        }
        return Promise.resolve([]);
    }

    export async function getReceivedVotesHistory(): Promise<VoteHistory> {

        return await RequestHandler.get({
            path: 'users/votehistory'
        }) as VoteHistory;
    }

    export async function getQuotedHistory(): Promise<QuoteHistory> {

        const result = await RequestHandler.get({
            path: 'users/quotedhistory'
        }) as QuoteHistory;

        UserCache.processMessages(result.messages);

        return result;
    }
}