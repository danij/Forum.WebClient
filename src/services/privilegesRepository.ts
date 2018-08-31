import {RequestHandler} from './requestHandler';
import {CommonEntities} from './commonEntities';

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
        allowAdjustPrivilege: boolean;
        entityType? : string;
        entityId?: string;
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
        allowAdjustPrivilege: boolean;
    }

    function filterAssignedPrivilegesCollection(value: any) {

        const result = value as AssignedPrivilegesCollection;

        result.discussionThreadMessagePrivileges = filterAssignedPrivileges(result.discussionThreadMessagePrivileges);
        result.discussionThreadPrivileges = filterAssignedPrivileges(result.discussionThreadPrivileges);
        result.discussionTagPrivileges = filterAssignedPrivileges(result.discussionTagPrivileges);
        result.discussionCategoryPrivileges = filterAssignedPrivileges(result.discussionCategoryPrivileges);

        //no filter needed in the case of forum wide privileges
        //result.forumWidePrivileges = filterAssignedPrivileges(result.forumWidePrivileges);

        return result;
    }

    function filterAssignedPrivileges(values: AssignedPrivilege[]) : AssignedPrivilege[] {

        if (null == values) return null;

        return values.filter(p => (null != p) && (null != p.id) && p.id.length);
    }

    export async function getThreadMessageRequiredPrivileges(messageId: string): Promise<RequiredPrivilegesCollection> {

        const result = (await RequestHandler.get({
            path: 'privileges/required/thread_message/' + encodeURIComponent(messageId)
        }) as RequiredPrivilegesCollection);

        result.entityType = result.entityType || 'thread_message';
        result.entityId = result.entityId || messageId;
        return result;
    }

    export async function getThreadRequiredPrivileges(threadId: string): Promise<RequiredPrivilegesCollection> {

        const result = await RequestHandler.get({
            path: 'privileges/required/thread/' + encodeURIComponent(threadId)
        }) as RequiredPrivilegesCollection;

        result.entityType = result.entityType || 'thread';
        result.entityId = result.entityId || threadId;
        return result;
    }

    export async function getTagRequiredPrivileges(tagId: string): Promise<RequiredPrivilegesCollection> {

        const result = await RequestHandler.get({
            path: 'privileges/required/tag/' + encodeURIComponent(tagId)
        }) as RequiredPrivilegesCollection;

        result.entityType = result.entityType || 'tag';
        result.entityId = result.entityId || tagId;
        return result;
    }

    export async function getCategoryRequiredPrivileges(categoryId: string): Promise<RequiredPrivilegesCollection> {

        const result = await RequestHandler.get({
            path: 'privileges/required/category/' + encodeURIComponent(categoryId)
        }) as RequiredPrivilegesCollection;

        result.entityType = result.entityType || 'category';
        result.entityId = result.entityId || categoryId;
        return result;
    }

    export async function getForumWideRequiredPrivileges(): Promise<RequiredPrivilegesCollection> {

        const result = await RequestHandler.get({
            path: 'privileges/required/forum_wide'
        }) as RequiredPrivilegesCollection;

        result.entityType = result.entityType || 'forum_wide';
        return result;
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

        return filterAssignedPrivilegesCollection(await RequestHandler.get({
            path: 'privileges/assigned/user/' + encodeURIComponent(userId)
        }));
    }

    export async function getForumWidePrivilegesOfCurrentUser() : Promise<CommonEntities.PrivilegesArray> {

        return (await RequestHandler.get({
            path: 'privileges/forum_wide/current_user'
        }) as CommonEntities.PrivilegesArray);
    }

    export async function assignThreadMessagePrivilege(messageId: string, userId: string,
                                                       value: number, duration: number): Promise<void> {

        return (await RequestHandler.post({
            path: 'privileges/thread_message/assign/' +
                [messageId, userId, value, duration].map(encodeURIComponent).join('/')
        }));
    }

    export async function assignThreadPrivilege(threadId: string, userId: string,
                                                value: number, duration: number): Promise<void> {

        return (await RequestHandler.post({
            path: 'privileges/thread/assign/' +
                [threadId, userId, value, duration].map(encodeURIComponent).join('/')
        }));
    }

    export async function assignTagPrivilege(tagId: string, userId: string,
                                             value: number, duration: number): Promise<void> {

        return (await RequestHandler.post({
            path: 'privileges/tag/assign/' +
                [tagId, userId, value, duration].map(encodeURIComponent).join('/')
        }));
    }

    export async function assignCategoryPrivilege(categoryId: string, userId: string,
                                                  value: number, duration: number): Promise<void> {

        return (await RequestHandler.post({
            path: 'privileges/category/assign/' +
                [categoryId, userId, value, duration].map(encodeURIComponent).join('/')
        }));
    }

    export async function assignForumWidePrivilege(userId: string, value: number, duration: number): Promise<void> {

        return (await RequestHandler.post({
            path: 'privileges/forum_wide/assign/' + [userId, value, duration].map(encodeURIComponent).join('/')
        }));
    }

    export async function changeRequiredPrivilege(privilegeType: string, entityType: string, entityId: string,
                                                  privilegeName: string, value: number): Promise<void> {

        const entityIdParameter = entityId.length ? ('/' + encodeURIComponent(entityId)) : '';

        return (await RequestHandler.post({
            path: `privileges/${privilegeType}/required/${entityType}${entityIdParameter}/`
                + [privilegeName, value].map(encodeURIComponent).join('/')
        }));
    }
}