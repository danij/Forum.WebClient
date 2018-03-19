import {RequestHandler} from "./requestHandler";

export module PrivilegesRepository {

    export interface RequiredPrivilege {

        name: string;
        value: string;
    }

    export interface RequiredPrivilegesCollection {

        discussionThreadMessagePrivileges?: RequiredPrivilege[];
        discussionThreadPrivileges?: RequiredPrivilege[];
        discussionTagPrivileges?: RequiredPrivilege[];
        discussionCategoryPrivileges?: RequiredPrivilege[];
        forumWidePrivileges?: RequiredPrivilege[];
    }

    export interface AssignedPrivilege {

        id: string;
        name: string;
        value: number;
        granted: number;
        expires: number;
    }

    export interface AssignedPrivilegesCollection {

        now: number;
        discussionThreadMessagePrivileges?: AssignedPrivilege[];
        discussionThreadPrivileges?: AssignedPrivilege[];
        discussionTagPrivileges?: AssignedPrivilege[];
        discussionCategoryPrivileges?: AssignedPrivilege[];
        forumWidePrivileges?: AssignedPrivilege[];
    }

    export async function getThreadMessageRequiredPrivileges(messageId: string): Promise<RequiredPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/required/thread_message/' + encodeURIComponent(messageId)
        }) as RequiredPrivilegesCollection);
    }

    export async function getThreadRequiredPrivileges(threadId: string): Promise<RequiredPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/required/thread/' + encodeURIComponent(threadId)
        }) as RequiredPrivilegesCollection);
    }

    export async function getTagRequiredPrivileges(tagId: string): Promise<RequiredPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/required/tag/' + encodeURIComponent(tagId)
        }) as RequiredPrivilegesCollection);
    }

    export async function getCategoryRequiredPrivileges(categoryId: string): Promise<RequiredPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/required/category/' + encodeURIComponent(categoryId)
        }) as RequiredPrivilegesCollection);
    }

    export async function getForumWideRequiredPrivileges(): Promise<RequiredPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/required/forum_wide'
        }) as RequiredPrivilegesCollection);
    }
    
    export async function getThreadMessageAssignedPrivileges(messageId: string): Promise<AssignedPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/assigned/thread_message/' + encodeURIComponent(messageId)
        }) as AssignedPrivilegesCollection);
    }

    export async function getThreadAssignedPrivileges(threadId: string): Promise<AssignedPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/assigned/thread/' + encodeURIComponent(threadId)
        }) as AssignedPrivilegesCollection);
    }

    export async function getTagAssignedPrivileges(tagId: string): Promise<AssignedPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/assigned/tag/' + encodeURIComponent(tagId)
        }) as AssignedPrivilegesCollection);
    }

    export async function getCategoryAssignedPrivileges(categoryId: string): Promise<AssignedPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/assigned/category/' + encodeURIComponent(categoryId)
        }) as AssignedPrivilegesCollection);
    }

    export async function getForumWideAssignedPrivileges(): Promise<AssignedPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/assigned/forum_wide'
        }) as AssignedPrivilegesCollection);
    }

    export async function getPrivilegesAssignedToUser(userId: string): Promise<AssignedPrivilegesCollection> {

        return (await RequestHandler.get({
            path: 'privileges/assigned/user/' + encodeURIComponent(userId)
        }) as AssignedPrivilegesCollection);
    }
}