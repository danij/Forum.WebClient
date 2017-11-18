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

    let latestTags: Tag[];

    export async function getTags(request: GetTagsRequest): Promise<TagCollection> {

        let result = await RequestHandler.get({
            path: 'tags',
            query: request || {orderBy: 'name', sort: 'ascending'}
        }) as TagCollection;
        latestTags = result.tags;
        return result;
    }

    export async function getTag(idOrName: string): Promise<Tag> {

        if (null == latestTags) await getTags(null);

        return latestTags.find(t => (idOrName === t.id) || (idOrName.toLowerCase() === t.name.toLowerCase())) || null;
    }
}
