import {UserRepository} from "./userRepository";
import {RequestHandler} from "./requestHandler";
import {UserCache} from "./userCache";
import {CommonEntities} from "./commonEntities";

export module PrivateMessageRepository {

    export interface PrivateMessage {

        id: string;
        created: number;
        ip: string;
        content: string;
        source: UserRepository.User;
        destination: UserRepository.User;
    }

    export interface PrivateMessageCollection extends CommonEntities.PaginationInfo {

        messages: PrivateMessage[];
    }

    export class GetPrivateMessagesRequest {

        page: number;
    }

    export async function getReceivedPrivateMessages(request: GetPrivateMessagesRequest): Promise<PrivateMessageCollection> {

        const result = await RequestHandler.get({
            path: 'private_messages/received',
            query: request
        });

        UserCache.processPrivateMessageCollection(result);

        return result;
    }

    export async function getSentPrivateMessages(request: GetPrivateMessagesRequest): Promise<PrivateMessageCollection> {

        const result = await RequestHandler.get({
            path: 'private_messages/sent',
            query: request
        });

        UserCache.processPrivateMessageCollection(result);

        return result;
    }

    export async function sendPrivateMessage(destinationId: string, content: string): Promise<string> {

        return await RequestHandler.post({
            path: 'private_messages/' + encodeURIComponent(destinationId),
            stringData: content
        });
    }

    export async function deletePrivateMessage(messageId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'private_messages/' + encodeURIComponent(messageId)
        });
    }
}