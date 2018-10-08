import {UserRepository} from "./userRepository";
import {CommonEntities} from "./commonEntities";
import {RequestHandler} from "./requestHandler";
import {UserCache} from "./userCache";

export module AttachmentsRepository {

    export interface Attachment {

        id: string;
        created: number;
        name: string;
        size: number;
        approved: boolean;
        nrOfMessagesAttached: number;
        nrOfGetRequests: number;
        ip: string;
        createdBy: UserRepository.User,
    }

    export interface AttachmentCollection extends CommonEntities.PaginationInfo {

        attachments: Attachment[];
    }

    export class GetAttachmentsRequest {

        page: number;
        sort: string;
    }

    export function defaultAttachmentCollection(): AttachmentCollection {

        return {
            attachments: [],
            page: 0,
            pageSize: 1,
            totalCount: 0,
        } as AttachmentCollection;
    }

    function filterAttachmentNulls(value: any, forceCreatedby?: UserRepository.User): AttachmentCollection {

        const result = value as AttachmentCollection;

        result.attachments = (result.attachments || []).filter(t => null != t);

        for (let attachment of result.attachments) {

            attachment.createdBy = attachment.createdBy || forceCreatedby || UserRepository.UnknownUser;
        }

        return result;
    }

    export async function getAllAttachments(request: GetAttachmentsRequest): Promise<AttachmentCollection> {

        const result = filterAttachmentNulls(await RequestHandler.get({
            path: 'attachments',
            query: request
        }));

        UserCache.processAttachmentCollection(result);

        return result;
    }

    export async function getAttachmentsAddedByUser(user: UserRepository.User,
                                                    request: GetAttachmentsRequest): Promise<AttachmentCollection> {

        const result = filterAttachmentNulls(await RequestHandler.get({
            path: 'attachments/user/' + encodeURIComponent(user.id),
            query: request
        }), user);

        UserCache.processAttachmentCollection(result);

        return result;
    }

    export async function getAttachment(attachmentId: string): Promise<Attachment> {

        return (await RequestHandler.get({
            path: 'attachment/' + encodeURIComponent(attachmentId)
        })).attachment as Attachment;
    }

    export async function editAttachmentName(attachmentId: string, newName: string): Promise<void> {

        await RequestHandler.put({
            path: 'attachments/name/' + encodeURIComponent(attachmentId) + '/' + encodeURIComponent(newName)
        });
    }

    export async function editAttachmentApproved(attachmentId: string, newApproved: boolean): Promise<void> {

        await RequestHandler.put({
            path: 'attachments/approval/' + encodeURIComponent(attachmentId) + '/' + (newApproved ? 'true' : 'false')
        });
    }

    export async function deleteAttachment(attachmentId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'attachments/' + encodeURIComponent(attachmentId)
        });
    }

    export async function addAttachmentToMessage(attachmentId: string,
                                                 messageId: string): Promise<AttachmentsRepository.Attachment> {

        return (await RequestHandler.post({
            path: 'attachments/message/' + encodeURIComponent(attachmentId) + '/' + encodeURIComponent(messageId)
        })).attachment as Attachment;
    }

    export async function removeAttachmentFromMessage(attachmentId: string, messageId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'attachments/message/' + encodeURIComponent(attachmentId) + '/' + encodeURIComponent(messageId)
        });
    }
}