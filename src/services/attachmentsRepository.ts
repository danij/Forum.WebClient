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
}