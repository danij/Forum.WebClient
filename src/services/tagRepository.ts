import {RequestHandler} from "./requestHandler";

export module TagRepository {

    export interface Tag {

        id: string;
        name: string;
        created: number;
        threadCount: number;
        messageCount: number;
    }

    export interface TagCollection {

        tags: Tag[];
    }

    export interface GetTagsRequest {

        orderBy: string;
        sort: string;
    }

    export async function getTags(request: GetTagsRequest): Promise<TagCollection> {

        return await RequestHandler.get({
            path: 'tags',
            query: request
        }) as TagCollection;
    }
}
