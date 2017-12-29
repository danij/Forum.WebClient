import {RequestHandler} from "./requestHandler";
import {CategoryRepository} from "./categoryRepository";

export module TagRepository {

    export interface Tag {

        id: string;
        name: string;
        created: number;
        threadCount: number;
        messageCount: number;
        latestMessage: CategoryRepository.LatestMessage;
        categories: CategoryRepository.Category[];
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

    export async function getTagsCached(): Promise<Tag[]> {

        if (latestTags) {

            return latestTags.slice();
        }
        return (await getTags(null)).tags.slice();
    }

    export async function getTag(name: string): Promise<Tag> {

        if (null == latestTags) await getTags(null);

        return latestTags.find(t => name.toLowerCase() === t.name.toLowerCase()) || null;
    }

    export async function addNewTag(name: string): Promise<void> {

        await RequestHandler.post({
            path: 'tags/',
            stringData: name
        });
    }

    export async function deleteTag(tagId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'tags/' + encodeURIComponent(tagId)
        });
    }

    export async function editTagName(tagId: string, newName: string): Promise<void> {

        await RequestHandler.put({
            path: 'tags/name/' + encodeURIComponent(tagId),
            stringData: newName
        });
    }

    export async function mergeTags(sourceTagId: string, destinationTagId: string): Promise<void> {

        await RequestHandler.post({
            path: 'tags/merge/' + encodeURIComponent(sourceTagId) + '/' + encodeURIComponent(destinationTagId)
        });
    }
}
