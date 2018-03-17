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

    export const EmptyUserId: string = '';

    export const UnknownUser = {

        id: EmptyUserId,
        name: '<Unknown>',
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

    export function sortByName(users: User[]): void {

        users.sort((first, second) => {

            return first.name.toLocaleLowerCase().localeCompare(second.name.toLocaleLowerCase());
        });
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

    export async function getUsersSubscribedToThread(threadId: string): Promise<User[]> {

        let collection = (await RequestHandler.get({
            path: 'users/subscribed/thread/' + encodeURIComponent(threadId)
        }) as UserCollection);

        collection.users = collection.users || [];
        UserRepository.sortByName(collection.users);
        return collection.users;
    }

    export async function getOnlineUsers(): Promise<User[]> {

        return (await RequestHandler.get({
            path: 'users/online',
        }) as OnlineUserCollection).online_users || [];
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

            let searchResult = await RequestHandler.get({
                path: 'users/search/' + encodeURIComponent(name),
                query: {}
            }) as UserSearchResult;
            const pageNumber = Math.floor(searchResult.index / searchResult.pageSize);
            const firstIndexInPage = pageNumber * searchResult.pageSize;

            let collectionPromises: Promise<UserCollection>[] = [

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

            let remaining = searchResult.pageSize - users.length;
            if (remaining > 0) {

                users = users.concat(collections[1].users.slice(0, remaining));
            }

            return users;
        }
        return Promise.resolve([]);
    }
}