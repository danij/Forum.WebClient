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
}